class AppError extends Error {
	constructor(message, statusCode, errors = undefined) {
		super(message);

		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith('4') ? 'failed' : 'error';
		this.isOperational = true;
		this.errors = errors;

		Error.captureStackTrace(this, this.constructor);
	}
}

export default AppError;
