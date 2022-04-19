const errorHandler = (err, req, res, next) => {
	const status = err.status || 400;

	res.status(status);
	res.send({
		error: {
			status,
			message: err.message,
			stack: process.env.NODE_ENV === "production" ? null : err.stack,
		},
	});
};

module.exports = {
	errorHandler,
};
