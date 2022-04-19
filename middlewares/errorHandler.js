const errorHandler = (err, req, res, next) => {
	const status = err.status || 400;

	res.status(status);
	// console.log(err);
	res.send({
		status,
		message: err.message,
		errors: err.errors ? err.errors : null,
		stack: process.env.NODE_ENV === "production" ? null : err.stack,
	});
};

module.exports = {
	errorHandler,
};
