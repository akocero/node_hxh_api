const express = require('express');
const cors = require('cors');
const AppError = require('./v1/utils/appError');

module.exports = async function (app) {
	app.use(cors());

	app.get('/', (req, res) => {
		res.redirect('https://hxh-api.vercel.app/');
	});

	app.get('/api/v1', (req, res) => {
		res.status(200).json({
			message: 'Welcome to Hunter x Hunter API Version 1!',
		});
	});

	app.use(express.urlencoded({ extended: true }));

	/* VERSION 1 ROUTES */
	app.use('/api/v1', require('./v1/routes/api_routes')());

	app.use((req, res, next) => {
		next(
			new AppError(
				`The requested endpoint '${req.originalUrl}' does not exist on this server`,
				404,
			),
		);
	});
};
