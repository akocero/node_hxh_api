const jwt = require('jsonwebtoken');
const Guest = require('../models/GuestModel.js');
const AppError = require('../utils/appError.js');
const catchUnknownError = require('../utils/catchUnknownError.js');

exports.protect = catchUnknownError(async (req, res, next) => {
	const { api_key } = req.query;

	if (!api_key) {
		return next(new AppError('Forbidden: No provided api key', 403));
	}

	// Verify token
	const decoded = jwt.verify(api_key, process.env.JWT_API_SECRET);

	// Get user from the token
	const authenticatedUser = await Guest.findById(decoded.id).select(
		'-password -createdAt -updatedAt -__v',
	);

	if (!authenticatedUser) {
		return next(
			new AppError(
				'The user belonging to this token does no longer exist.',
				401,
			),
		);
	}

	if (!authenticatedUser.verified_email) {
		return next(new AppError('Api key is not yet verified.', 401));
	}

	req.user = authenticatedUser;
	next();
});
