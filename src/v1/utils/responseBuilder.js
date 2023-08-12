const { getReasonPhrase } = require('http-status-codes');

module.exports.jsonResponse = (statusCode, message, data) => {
	let statusText = getReasonPhrase(statusCode);

	if (data && data._paginate) {
		return paginatedResponse(statusCode, message, data);
	}

	let jsonResponse = {
		status: 'success',
		statusCode,
		statusText,
		message,
		data,
	};

	return jsonResponse;
};

const paginatedResponse = (statusCode, message, data) => {
	let statusText = getReasonPhrase(statusCode);
	const _paginate = data._paginate;
	delete data._paginate;
	let jsonResponse = {
		status: 'success',
		statusCode,
		statusText,
		message,
		data: data.data,
		_paginate,
	};

	return jsonResponse;
};

module.exports.errorResponse = (statusCode, stack, message, errors) => {
	let statusText = getReasonPhrase(statusCode);
	let jsonResponse = {
		status: 'failure',
		statusCode,
		statusText,
		message,
		errors,
		stack,
	};

	return jsonResponse;
};
