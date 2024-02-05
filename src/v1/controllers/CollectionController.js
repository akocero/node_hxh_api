const BaseController = require('./BaseController');
const AppError = require('../utils/appError.js');
const { jsonResponse } = require('../utils/responseBuilder');

class CollectionController extends BaseController {}

module.exports = CollectionController;
