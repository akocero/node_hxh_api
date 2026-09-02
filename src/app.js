const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// middlewares / utilities
const globalErrorHandler = require('./v1/middlewares/globalErrorHandler');

const app = express();

// Trust Render's (and other single-hop) reverse proxy so express-rate-limit
// can read the real client IP from X-Forwarded-For
app.set('trust proxy', 1);

// Set secure HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// Limit request body size to prevent large payload attacks
app.use(express.json({ limit: process.env.BODY_LIMIT || '10kb' }));

// Strip $-prefixed keys from req.body/query/params to block NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP parameter pollution (e.g. ?sort=name&sort=password)
app.use(hpp());

// Global rate limiter — applies to all /api routes
const globalLimiter = rateLimit({
	windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW_MIN) || 15) * 60 * 1000,
	max: parseInt(process.env.RATE_LIMIT_MAX) || 200,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		status: 'failure',
		statusCode: 429,
		message: 'Too many requests, please try again later.',
	},
});

// Strict limiter for sensitive auth endpoints (login, register, forgot password)
const authLimiter = rateLimit({
	windowMs: (parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MIN) || 15) * 60 * 1000,
	max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		status: 'failure',
		statusCode: 429,
		message: 'Too many attempts, please try again later.',
	},
});

app.use('/api', globalLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/forgot_password', authLimiter);
app.use('/api/v1/guest/register', authLimiter);
app.use('/api/v1/guest/magic_link', authLimiter);
app.use('/api/v1/guest/login', authLimiter);
app.use('/api/v1/guest/forgot_password', authLimiter);

const routes = require('./api_routes');
routes(app);

// the catchUnknownError will use this to handle possible error occured
app.use(globalErrorHandler);

module.exports = app;
