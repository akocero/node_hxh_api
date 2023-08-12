const Model = require('../models/UserModel.js');
const BaseService = require('./BaseService');
const jwt = require('jsonwebtoken');
const Email = require('../helpers/EmailHelper.js');
const crypto = require('crypto');

class AuthService extends BaseService {
	Model;
	static className = 'AuthService';
	constructor() {
		super(Model);

		this.Model = Model;
		this.with_relation = false;
		this.relations = {};
	}

	async generateKey(email) {
		const user = await this.Model.findOne({ email }).select('+password');

		const is_password_match = await user.comparePassword(
			password,
			user.password,
		);

		if (!is_password_match) {
			return false;
		}

		const token = this.createToken(user._id);

		return {
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
			},
			token,
		};
	}

	async login(email, password) {
		const user = await this.Model.findOne({ email }).select('+password');
		if (!user) {
			return false;
		}

		const is_password_match = await user.comparePassword(
			password,
			user.password,
		);

		if (!is_password_match) {
			return false;
		}

		const token = this.createToken(user._id);

		return {
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
			},
			token,
		};
	}

	async updatePassword({ id, password, new_password, password_confirm }) {
		const user = await this.Model.findById(id).select('+password');

		if (!user) {
			return false;
		}

		const is_password_match = await user.comparePassword(
			password,
			user.password,
		);

		if (!is_password_match) {
			return false;
		}

		user.password = new_password;
		user.passwordConfirm = password_confirm;
		await user.save();

		const token = this.createToken(user._id);

		return {
			_id: user.id,
			name: user.name,
			email: user.email,
			token,
		};
	}

	async findByEmail(email) {
		const user = await this.Model.findOne({ email });

		if (!user) {
			return false;
		}

		return user;
	}

	async register({ name, email, password, password_confirm }) {
		const user = await this.Model.create({
			name,
			email,
			password,
			passwordConfirm: password_confirm,
		});

		if (!user) {
			return false;
		}

		const token = this.createToken(user._id);

		return {
			user: {
				_id: user.id,
				name: user.name,
				email: user.email,
			},
			token,
		};
	}

	async selfUpdate(id, payload) {
		const updatedUser = await this.Model.findByIdAndUpdate(id, payload, {
			new: true,
			runValidators: true,
		});

		return updatedUser;
	}

	async forgotPassword(user, origin) {
		// populate to user passwordResetToken and PasswordResetTokenExpires
		const resetToken = user.createPasswordResetToken();

		// req.headers.origin it will work only at system request not on postman
		const resetURL = `${origin}/auth/reset_password/${resetToken}`;

		try {
			await new Email({ email: user.email }).sendPasswordReset(resetURL);

			await user.save({ validateBeforeSave: false });

			return resetToken;
		} catch (err) {
			return false;
		}
	}

	async resetPassword(reset_password_token, password, password_confirm) {
		const hashedToken = crypto
			.createHash('sha256')
			.update(reset_password_token)
			.digest('hex');

		const user = await this.Model.findOne({
			passwordResetToken: hashedToken,
			passwordResetExpires: { $gt: Date.now() },
		});

		if (!user) {
			return false;
		}

		user.password = password;
		user.passwordConfirm = password_confirm;
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;

		await user.save();

		return true;
	}

	async selfDeactivate(id) {
		const user = await this.Model.findByIdAndUpdate(id, { active: false });

		if (!user) {
			return false;
		}

		return true;
	}

	createToken(id) {
		return jwt.sign({ id }, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRES_IN,
		});
	}
}

module.exports = AuthService;
