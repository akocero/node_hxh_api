const express = require('express');
const router = express.Router();

/**
 * @file api_routes.js
 * @brief Auth generate router
 * @author Eugene Paul Badato
 */

/**
 * API ROUTES
 */

const index = require('./index');
module.exports = function () {
	for (const [key, value] of Object.entries(index)) {
		const Router = index[key];
		router.use(Router);
	}

	return router;
};
