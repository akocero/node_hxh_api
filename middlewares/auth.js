const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { createError } = require("../utils/createError");

const auth = async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		try {
			// Get token from header
			token = req.headers.authorization.split(" ")[1];

			// Verify token
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// Get user from the token
			req.user = await User.findById(decoded.id).select(
				"-password -createdAt -updatedAt -__v"
			);

			next();
		} catch (error) {
			return next(createError(401, "Unauthorized"));
		}
	}

	if (!token) {
		return next(createError(403, "Forbidden"));
	}
};

module.exports = { auth };
