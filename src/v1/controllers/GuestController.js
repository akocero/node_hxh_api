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

	async selfVerify(req, res, next) {
		const { token } = req.query;

		if (!token) {
			return next(new AppError('Verification token is missing.', 400));
		}

		const BaseService = new this.BaseService();
		const user = await BaseService.selfVerify(token);

		if (!user) {
			return next(
				new AppError(
					'Verification failed, Please try again later.',
					400,
				),
			);
		}

		const statusCode = 200;
		res.status(statusCode).json(
			jsonResponse(statusCode, 'Verified successfully.'),
		);
	}

	async register(req, res, next) {
		const { name, email, usage } = req.body;

		if (!name || !email || !usage) {
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

		const is_email_sent = await BaseService.sendVerificationEmail(
			user.email,
			user.verification_token,
			user.api_key,
		);

		if (!is_email_sent) {
			return next(
				new AppError(
					'Failed sending email verification please try again later.',
					400,
				),
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
}

module.exports = CustomerController;
