import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';
import { catchUnknownError } from './catchUnknownError.js';

const protect = catchUnknownError(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		// Get token from header
		token = req.headers.authorization.split(' ')[1];
	}
	// console.log(req.headers);
	if (!token) {
		return next(new AppError('Forbidden', 403));
	}

	// Verify token
	const decoded = jwt.verify(token, process.env.JWT_SECRET);

	// Get user from the token
	const authenticatedUser = await User.findById(decoded.id).select(
		'-password -createdAt -updatedAt -__v',
	);

	if (!authenticatedUser) {
		return next(new AppError('Unauthorized', 401));
	}

	req.user = authenticatedUser;
	next();
});

const restrictedTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError(
					'You do not have permission to perform this action',
					403,
				),
			);
		}

		next();
	};
};

export default { protect, restrictedTo };
