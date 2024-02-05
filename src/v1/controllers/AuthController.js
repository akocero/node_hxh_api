const BaseController = require('./BaseController');
const AppError = require('../utils/appError.js');
const { jsonResponse } = require('../utils/responseBuilder');

class CustomerController extends BaseController {
	constructor(services, helpers) {
		super(services, helpers);
	}

	self(req, res) {
		const statusCode = 200;
		res.status(statusCode).json(
			jsonResponse(statusCode, 'Data retrieved successfully.', req.user),
		);
	}

	async login(req, res, next) {
		const { email, password } = req.body;

		if (!email || !password) {
			return next(
				new AppError(
					'Your request seems to be incorrect or missing.',
					400,
				),
			);
		}

		const BaseService = new this.BaseService();
		const user = await BaseService.login(email, password);

		if (!user) {
			return next(new AppError('Invalid login credentials', 401));
		}

		const statusCode = 200;
		res.status(statusCode).json(
			jsonResponse(statusCode, 'Login successful', user),
		);
	}

	async register(req, res, next) {
		const { name, email, password, password_confirm } = req.body;

		if (!name || !email || !password || !password_confirm) {
			return next(
				new AppError(
					'Your request seems to be incorrect or missing.',
					400,
				),
			);
		}

		const BaseService = new this.BaseService();
		const userExists = await BaseService.findByEmail(email);

		if (userExists) {
			return next(
				new AppError(
					'The provided email address is already registered',
					400,
				),
			);
		}

		const user = await BaseService.register(req.body);

		if (!user) {
			return next(
				new AppError(
					'Your request seems to be incorrect or missing.',
					400,
				),
			);
		}

		const statusCode = 201;
		res.status(statusCode).json(
			jsonResponse(statusCode, 'Register successful', user),
		);
	}

	async updatePassword(req, res, next) {
		const { new_password, password, password_confirm } = req.body;
		const id = req.user.id;

		if (!new_password || !password || !password_confirm) {
			return next(
				new AppError(
					'Your request seems to be incorrect or missing.',
					400,
				),
			);
		}

		const BaseService = new this.BaseService();
		const user = await BaseService.updatePassword({
			id,
			...req.body,
		});

		if (!user) {
			return next(
				new AppError(
					'Your request seems to be incorrect or missing.',
					401,
				),
			);
		}

		const statusCode = 200;
		res.status(statusCode).json(
			jsonResponse(
				statusCode,
				'Password updated successfully',
				undefined,
			),
		);
	}

	async selfUpdate(req, res, next) {
		const { password, password_confirm, passwordConfirm } = req.body;
		const { _id: id } = req.user;
		// this is to prevent updating password or password_confirm
		if (password || password_confirm || passwordConfirm) {
			return next(
				new AppError(
					'You added forbidden field, The developer will contact you!',
					400,
				),
			);
		}

		const filteredBody = this.filterObj(req.body, 'name', 'email');
		// if (req.file) filteredBody.photo = req.file.filename; for photos

		const BaseService = new this.BaseService();
		const user = await BaseService.selfUpdate(id, filteredBody);

		if (!user) {
			return next(
				new AppError(
					'There was a problem updating your info. Please try again later.',
					400,
				),
			);
		}

		const statusCode = 200;
		res.status(statusCode).json(
			jsonResponse(statusCode, 'Updated succesfully', user),
		);
	}

	addTokenCookie(res, token) {
		res.cookie('jwt', token, {
			expires: new Date(
				Date.now() +
					process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
			),
			httpOnly: true,
			secure: false,
			//   secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
		});

		return token;
	}

	async forgotPassword(req, res, next) {
		const { email } = req.body;

		if (!email) {
			return next(new AppError('Email is required.', 400));
		}

		const BaseService = new this.BaseService();
		const user = await BaseService.findByEmail(email);

		if (!user) {
			return next(
				new AppError(
					'The provided email address is not registered or inactive.',
					404,
				),
			);
		}

		const response = await BaseService.forgotPassword(
			user,
			req.headers.origin,
		);

		if (!response) {
			return next(
				new AppError(
					'The email could not be sent at the moment. Please try again later.',
					500,
				),
			);
		}

		const statusCode = 200;
		res.status(statusCode).json(
			jsonResponse(
				statusCode,
				'A password reset email has been sent to your registered email address. Please follow the instructions in the email to reset your password.',
				undefined,
			),
		);
	}

	async resetPassword(req, res, next) {
		const { password, password_confirm } = req.body;
		const token = req.params.token;

		if (!token) {
			return next(new AppError('Unauthorized', 401));
		}

		if (!password || !password_confirm) {
			return next(
				new AppError(
					'Your request seems to be incorrect or missing.',
					400,
				),
			);
		}

		const BaseService = new this.BaseService();
		const user = await BaseService.resetPassword(
			token,
			password,
			password_confirm,
		);

		if (!user) {
			return next(
				new AppError(
					'Token is invalid or expired, Please try again later.',
					400,
				),
			);
		}

		const statusCode = 200;
		res.status(statusCode).json(
			jsonResponse(
				statusCode,
				'Your password was successfully reset. Log in using your new password.',
				undefined,
			),
		);
	}

	async selfDeactivate(req, res) {
		const BaseService = new this.BaseService();
		const user = await BaseService.selfDeactivate(req.user.id);

		if (!user) {
			return next(new AppError('Error deactivating you.', 401));
		}

		const statusCode = 204;
		res.status(statusCode).json(
			jsonResponse(statusCode, 'Deactivate successful', undefined),
		);
	}

	filterObj(obj, ...allowedFields) {
		const newObj = {};
		Object.keys(obj).forEach((el) => {
			if (allowedFields.includes(el)) newObj[el] = obj[el];
		});
		return newObj;
	}
}

module.exports = CustomerController;
