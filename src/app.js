const path = require('path');
const express = require('express');
const morgan = require('morgan');

// middlewares / utilities
const globalErrorHandler = require('./v1/middlewares/globalErrorHandler');

const app = express();

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

const routes = require('./api_routes');
routes(app);

// the catchUnknownError will use this to handle possible error occured
app.use(globalErrorHandler);

module.exports = app;
