export const errorHandler = (err, req, res, next) => {
	const status = err.status || 400;

	res.status(status);
	res.send({
		status,
		message: err.message,
		errors: err.errors ? err.errors : err,
		stack: process.env.NODE_ENV === 'production' ? null : err.stack
	});
};
