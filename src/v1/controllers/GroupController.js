const BaseController = require('./BaseController');
const AppError = require('../utils/appError.js');
const { jsonResponse } = require('../utils/responseBuilder');

class GroupController extends BaseController {}

module.exports = GroupController;
