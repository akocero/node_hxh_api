const Guest = require('../models/GuestModel.js');
const AppError = require('../utils/appError.js');
const catchUnknownError = require('../utils/catchUnknownError.js');
const auth = require('./auth');

exports.protect = catchUnknownError(async (req, res, next) => {
	const api_key = req.headers['x-api-key'];

	if (!api_key) {
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith('Bearer')
		) {
			auth.protect(req, res, next);
			return;
		}
		return next(new AppError('Forbidden: No provided api key', 403));
	}

	const authenticatedUser = await Guest.findOne({ api_key }).select(
		'-createdAt -updatedAt -__v',
	);

	if (!authenticatedUser) {
		return next(new AppError('Invalid api key.', 401));
	}

	if (!authenticatedUser.verified_email) {
		return next(new AppError('Api key is not yet verified.', 401));
	}

	req.user = authenticatedUser;
	next();
});
