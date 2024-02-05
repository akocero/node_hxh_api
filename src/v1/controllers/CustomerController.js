const BaseController = require('./BaseController');
const AppError = require('../utils/appError.js');
const { jsonResponse } = require('../utils/responseBuilder');

class CustomerController extends BaseController {}

module.exports = CustomerController;
