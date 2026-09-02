const BaseController = require('./BaseController');
const AppError = require('../utils/appError.js');
const { jsonResponse } = require('../utils/responseBuilder');

class GuestController extends BaseController {
	constructor(services, helpers) {
		super(services, helpers);
	}

	self(req, res) {
		const { password, ...rest } = req.user.toObject();
		const data = { ...rest, has_password: !!password };
		const statusCode = 200;
		res.status(statusCode).json(
			jsonResponse(statusCode, 'Data retrieved successfully.', data),
		);
	}

	async selfVerify(req, res, next) {
		const { token } = req.query;

		if (!token) {
			return next(new AppError('Verification token is missing.', 400));
		}

		const BaseService = new this.BaseService();
		const guest = await BaseService.selfVerify(token);

		if (!guest) {
			return next(new AppError('Verification link is invalid or has already been used.', 400));
		}

		const jwtToken = BaseService.createGuestToken(guest._id);

		const statusCode = 200;
		res.status(statusCode).json(
			jsonResponse(statusCode, 'Email verified successfully. Welcome!', {
				token: jwtToken,
				guest: {
					_id: guest._id,
					name: guest.name,
					email: guest.email,
					usage: guest.usage,
					api_key: guest.api_key,
					api_key_expires: guest.api_key_expires,
				},
			}),
		);
	}

	async register(req, res, next) {
		const { name, email, usage } = req.body;

		if (!name || !email || !usage) {
			return next(new AppError('Your request seems to be incorrect or missing.', 400));
		}

		const BaseService = new this.BaseService();
		const userExists = await BaseService.findByEmail(email);

		if (userExists) {
			return next(new AppError('The provided email address is already registered', 400));
		}

		const user = await BaseService.register(req.body);

		if (!user) {
			return next(new AppError('Your request seems to be incorrect or missing.', 400));
		}

		const is_email_sent = await BaseService.sendVerificationEmail(
			user.email,
			user.name,
			user.verification_token,
			user.api_key,
		);

		if (!is_email_sent) {
			return next(
				new AppError('Failed sending email verification please try again later.', 400),
			);
		}

		const statusCode = 201;
		res.status(statusCode).json(
			jsonResponse(
				statusCode,
				`A verification link to activate your key was sent to: ${user.email}`,
			),
		);
	}

	// --- magic link ---

	async requestMagicLink(req, res, next) {
		const { email } = req.body;

		if (!email) {
			return next(new AppError('Email is required.', 400));
		}

		const BaseService = new this.BaseService();
		const result = await BaseService.sendMagicLink(email);

		if (result.found === false) {
			return next(
				new AppError('No account found with that email address.', 404),
			);
		}

		if (result.notVerified) {
			return next(
				new AppError(
					'Your email is not verified. Please check your inbox and click the verification link.',
					403,
				),
			);
		}

		if (result.hasPassword) {
			return next(
				new AppError(
					'A password is linked to your account. If you forgot it, please use Forgot Password instead.',
					400,
				),
			);
		}

		if (result.emailFailed) {
			return next(
				new AppError('Failed to send magic link. Please try again later.', 500),
			);
		}

		const statusCode = 200;
		res.status(statusCode).json(
			jsonResponse(statusCode, 'Magic link sent! Check your email to log in.'),
		);
	}

	async verifyMagicLink(req, res, next) {
		const { token } = req.query;

		if (!token) {
			return next(new AppError('Token is missing.', 400));
		}

		const BaseService = new this.BaseService();
		const result = await BaseService.verifyMagicLink(token);

		if (!result) {
			return next(new AppError('Magic link is invalid or has expired.', 400));
		}

		const statusCode = 200;
		res.status(statusCode).json(
			jsonResponse(statusCode, 'Login successful.', {
				token: result.token,
				guest: {
					_id: result.guest._id,
					name: result.guest.name,
					email: result.guest.email,
					usage: result.guest.usage,
					api_key: result.guest.api_key,
					api_key_expires: result.guest.api_key_expires,
				},
			}),
		);
	}

	// --- password login ---

	async login(req, res, next) {
		const { email, password } = req.body;

		if (!email || !password) {
			return next(new AppError('Email and password are required.', 400));
		}

		const BaseService = new this.BaseService();
		const result = await BaseService.login(email, password);

		if (!result) {
			return next(new AppError('Invalid login credentials.', 401));
		}

		if (result.notVerified) {
			return next(
				new AppError(
					'Your email is not verified. Please check your inbox and click the verification link.',
					403,
				),
			);
		}

		if (result.noPassword) {
			return next(
				new AppError(
					'No password set for this account. Please use the magic link to log in.',
					400,
				),
			);
		}

		const statusCode = 200;
		res.status(statusCode).json(
			jsonResponse(statusCode, 'Login successful.', {
				token: result.token,
				guest: {
					_id: result.guest._id,
					name: result.guest.name,
					email: result.guest.email,
					usage: result.guest.usage,
					api_key: result.guest.api_key,
					api_key_expires: result.guest.api_key_expires,
				},
			}),
		);
	}

	// --- set password ---

	async setPassword(req, res, next) {
		const { password, password_confirm } = req.body;

		if (!password || !password_confirm) {
			return next(new AppError('Password and password confirmation are required.', 400));
		}

		if (password !== password_confirm) {
			return next(new AppError('Passwords do not match.', 400));
		}

		const BaseService = new this.BaseService();
		const result = await BaseService.setPassword(req.user._id, password);

		if (!result) {
			return next(new AppError('Something went wrong. Please try again.', 500));
		}

		if (result.alreadySet) {
			return next(
				new AppError(
					'You already have a password set. Use Forgot Password to reset it.',
					400,
				),
			);
		}

		const statusCode = 200;
		res.status(statusCode).json(
			jsonResponse(statusCode, 'Password set successfully. You can now log in with your password.'),
		);
	}

	// --- forgot / reset password ---

	async forgotPassword(req, res, next) {
		const { email } = req.body;

		if (!email) {
			return next(new AppError('Email is required.', 400));
		}

		const BaseService = new this.BaseService();
		const guest = await BaseService.findByEmail(email);

		if (!guest) {
			return next(new AppError('No account found with that email address.', 404));
		}

		const sent = await BaseService.forgotPassword(guest);

		if (!sent) {
			return next(
				new AppError('Failed to send reset email. Please try again later.', 500),
			);
		}

		const statusCode = 200;
		res.status(statusCode).json(
			jsonResponse(
				statusCode,
				'A password reset link has been sent to your email address.',
			),
		);
	}

	async resetPassword(req, res, next) {
		const { password, password_confirm } = req.body;
		const { token } = req.params;

		if (!token) {
			return next(new AppError('Reset token is missing.', 400));
		}

		if (!password || !password_confirm) {
			return next(new AppError('Password and confirmation are required.', 400));
		}

		if (password !== password_confirm) {
			return next(new AppError('Passwords do not match.', 400));
		}

		const BaseService = new this.BaseService();
		const result = await BaseService.resetPassword(token, password);

		if (!result) {
			return next(new AppError('Reset token is invalid or has expired.', 400));
		}

		const statusCode = 200;
		res.status(statusCode).json(
			jsonResponse(statusCode, 'Password reset successfully. You can now log in.'),
		);
	}

	async regenerateApiKey(req, res, next) {
		const BaseService = new this.BaseService();
		const result = await BaseService.regenerateApiKey(req.user._id);

		if (!result) {
			return next(new AppError('Something went wrong. Please try again.', 500));
		}

		const statusCode = 200;
		res.status(statusCode).json(
			jsonResponse(statusCode, 'API key regenerated successfully.', result),
		);
	}

	async selfDeactivate(req, res, next) {
		const BaseService = new this.BaseService();
		const user = await BaseService.selfDeactivate(req.user._id);

		if (!user) {
			return next(new AppError('Error deactivating account.', 401));
		}

		const statusCode = 204;
		res.status(statusCode).json(jsonResponse(statusCode, 'Deactivate successful', undefined));
	}
}

module.exports = GuestController;
