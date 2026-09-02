const jwt = require('jsonwebtoken');
const Guest = require('../models/GuestModel.js');
const AppError = require('../utils/appError.js');
const catchUnknownError = require('../utils/catchUnknownError.js');

exports.protect = catchUnknownError(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}

	if (!token) {
		return next(new AppError('Unauthorized: No provided token', 401));
	}

	let decoded;
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET);
	} catch {
		return next(new AppError('Unauthorized: Invalid or expired token', 401));
	}

	if (decoded.type !== 'guest') {
		return next(new AppError('Forbidden: Invalid token type', 403));
	}

	const guest = await Guest.findById(decoded.id).select(
		'+password -magicLinkToken -magicLinkExpires -passwordResetToken -passwordResetExpires -verification_token -__v',
	);

	if (!guest) {
		return next(new AppError('The account belonging to this token no longer exists.', 401));
	}

	if (guest.changedPasswordAfter(decoded.iat)) {
		return next(new AppError('Password was recently changed. Please log in again.', 401));
	}

	req.user = guest;
	next();
});
