const AppError = require('../utils/appError.js');
const { errorResponse } = require('../utils/responseBuilder');

const handleDuplicateFieldsDB = (err) => {
	const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
	const message = `Duplicate value: ${value}. Please use another value!`;

	return new AppError(message, 400);
};

const handleCastErrorDB = (err) => {
	const message = `Invalid ${err.path}: ${err.value}.`;
	return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
	let errors = {};
	Object.values(err.errors).map((item) => {
		errors[item.path] = item.message;
	});

	console.log('errors', errors);

	const message = `Invalid payload.`;
	return new AppError(message, 400, errors);
};

const dispatchDevelopmentError = (err, req, res) => {
	return res
		.status(err.statusCode)
		.json(
			errorResponse(err.statusCode, err.stack, err.message, err.errors),
		);
};

const dispatchProductionError = (err, req, res) => {
	if (err.isOperational) {
		return res
			.status(err.statusCode)
			.json(errorResponse(err.statusCode, undefined, err.message));
	}

	return res.status(500).json({
		status: 'error',
		message: 'Something went very wrong!',
	});
};

const handleBadJSONFormat = (err) => {
	return new AppError(err.message, 400);
};

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';
	err.stack = err.stack;

	// this log (console.log(err)) contains the file path or the stack of the error
	// it is for you! you don't need to return it to the client
	console.log(err);

	let error = { ...err };
	error.message = err.message;
	if (err.name === 'CastError') error = handleCastErrorDB(error);
	if (err.code === 11000) error = handleDuplicateFieldsDB(error);
	if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

	if (err.expose) error = handleBadJSONFormat(error);

	if (err.name === 'JsonWebTokenError')
		error = new AppError(err.message, 401);

	if (err.name === 'TokenExpiredError') {
		error = new AppError('Expired Token', 401);
	}

	if (process.env.NODE_ENV === 'development') {
		dispatchDevelopmentError(error, req, res);
	} else {
		dispatchProductionError(error, req, res);
	}
};
