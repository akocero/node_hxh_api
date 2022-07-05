import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { createError } from '../utils/createError.js';
import AppError from '../utils/appError.js';
export const auth = async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		try {
			// Get token from header
			token = req.headers.authorization.split(' ')[1];

			// Verify token
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// Get user from the token
			req.user = await User.findById(decoded.id).select(
				'-password -createdAt -updatedAt -__v',
			);

			next();
		} catch (error) {
			return next(new AppError('Unauthorized', 401));
		}
	}

	if (!token) {
		return next(new AppError('Forbidden', 403));
	}
};
