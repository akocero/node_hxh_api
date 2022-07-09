import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';
import sendEmail from '../utils/email.js';
import crypto from 'crypto';

const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

const forgotPassword = async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new AppError('This email is not exist', 404));
	}

	const resetToken = user.createPasswordResetToken();
	user.save();

	const resetURL = `${req.protocol}://${req.get(
		'host',
	)}/api/v1/auth/resetPassword/${resetToken}`;

	const message = `Forgot you password? Submit a PATCH request with your new password to: ${resetURL}. \n If you didn't forget your password, please ignore this email!`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Your password reset token (valid for 10 min)',
			message,
		});

		res.status(200).json({
			status: 'success',
			message: 'Token sent to your email!',
		});
	} catch (err) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;

		await user.save({ validateBeforeSave: false });

		return next(
			new AppError(
				'There was an error sending the email, Please try again later!',
				500,
			),
		);
	}
};

const resetPassword = async (req, res, next) => {
	const hashedToken = crypto
		.createHash('sha256')
		.update(req.params.token)
		.digest('hex');

	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: { $gt: Date.now() },
	});

	if (!user) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save();
		return next(
			new AppError('Token is invalid or expired, Please try again!', 400),
		);
	}

	if (!req.body.password) {
		return next(new AppError('Please provide a new password!', 400));
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(req.body.password, salt);

	user.password = hashedPassword;

	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;

	await user.save();

	res.status(200).json({
		status: 'success',
		message: 'Password is reset successfully, Try to login again!',
	});
};

const register = async (req, res, next) => {
	const { name, email, password } = req.body;

	if (!name || !email || !password) {
		return next(new AppError('Invalid inputs', 400));
	}

	const userExists = await User.findOne({ email });

	if (userExists) {
		return next(new AppError('User already exist', 400));
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	const user = await User.create({
		name,
		email,
		password: hashedPassword,
	});

	if (!user) {
		return next(new AppError('Invalid inputs', 400));
	}

	res.status(201).json({
		_id: user.id,
		name: user.name,
		email: user.email,
		token: generateToken(user._id),
	});
};

const login = async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return next(new AppError('Invalid inputs', 400));
	}

	const user = await User.findOne({ email }).select('+password');

	if (!user || !(await user.comparePassword(password, user.password))) {
		return next(new AppError('Incorrect email or password', 401));
	}

	res.json({
		_id: user.id,
		name: user.name,
		email: user.email,
		token: generateToken(user._id),
	});
};

const me = async (req, res) => {
	res.status(200).json(req.user);
};

const updatePassword = async (req, res, next) => {
	const { newPassword, password } = req.body;

	if (!newPassword || !password) {
		return next(new AppError('Invalid Inputs', 400));
	}

	const user = await User.findById(req.user.id).select('+password');

	const correctPassword = await user.comparePassword(password, user.password);

	if (!correctPassword) {
		return next(new AppError('Your current password is wrong', 400));
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(newPassword, salt);

	user.password = hashedPassword;
	await user.save({ validateBeforeSave: false });

	res.json({
		_id: user.id,
		name: user.name,
		email: user.email,
		token: generateToken(user._id),
	});
};

export { register, login, me, forgotPassword, resetPassword, updatePassword };
