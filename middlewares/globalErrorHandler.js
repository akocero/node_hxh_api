import AppError from '../utils/appError.js';

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

	// excludedFields.forEach((el) => delete queryObj[el]);

	const message = `Invalid inputs`;
	return new AppError(message, 400, errors);
};

const dispatchDevelopmentError = (err, req, res) => {
	return res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
	});
};

const dispatchProductionError = (err, req, res) => {
	if (err.isOperational && err.errors) {
		return res.status(err.statusCode).json({
			status: err.status,
			errors: err.errors,
			message: err.message,
		});
	}

	if (err.isOperational) {
		return res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	}

	console.error('ERROR 💥', err);

	return res.status(500).json({
		status: 'error',
		message: 'Something went very wrong!',
	});
};

const handleBadJSONFormat = (err) => {
	return new AppError(err.message, 400);
};

export default (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		console.log(err.name);
		dispatchDevelopmentError(err, req, res);
	} else {
		let error = { ...err };

		error.message = err.message;
		if (err.name === 'CastError') error = handleCastErrorDB(error);
		if (err.code === 11000) error = handleDuplicateFieldsDB(error);
		if (err.name === 'ValidationError')
			error = handleValidationErrorDB(error);
		if (err.expose) error = handleBadJSONFormat(error);

		dispatchProductionError(error, req, res);
	}
};
