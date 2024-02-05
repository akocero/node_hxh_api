const BaseController = require('./BaseController');
const AppError = require('../utils/appError.js');
const { jsonResponse } = require('../utils/responseBuilder');

class CharacterController extends BaseController {}

module.exports = CharacterController;
