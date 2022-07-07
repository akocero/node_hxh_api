import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { createError } from '../utils/createError.js';
import AppError from '../utils/appError.js';

const register = async (req, res, next) => {
	const { name, email, password } = req.body;

	if (!name || !email || !password) {
		return next(new AppError('Invalid inputs', 400));
	}

	// Check if user exists
	const userExists = await User.findOne({ email });

	if (userExists) {
		return next(new AppError('User already exist', 400));
	}

	// Hash password
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	// Create user
	const user = await User.create({
		name,
		email,
		password: hashedPassword,
	});

	if (user) {
		res.status(201).json({
			_id: user.id,
			name: user.name,
			email: user.email,
			token: generateToken(user._id),
		});
	} else {
		return next(new AppError('Invalid inputs', 400));
	}
};

const login = async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return next(new AppError('Invalid inputs', 400));
	}

	// Check for user email
	const user = await User.findOne({ email }).select('+password');

	if (!user || !(await user.correctPassword(password, user.password))) {
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

// Generate JWT
const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

export { register, login, me };
