const express = require('express');
const guestAuth = require('../middlewares/guestAuth');
const catchUnknownError = require('../utils/catchUnknownError.js');

const { GuestService: MainService } = require('../services/index');
const _MainController = require('../controllers/GuestController');

const router = express.Router();
const MainController = new _MainController([MainService]);
const prefix = '/guest';

// public — no auth
router.get(`${prefix}/self_verify`, catchUnknownError(MainController.selfVerify.bind(MainController)));
router.post(`${prefix}/register`, catchUnknownError(MainController.register.bind(MainController)));
router.post(`${prefix}/magic_link`, catchUnknownError(MainController.requestMagicLink.bind(MainController)));
router.get(`${prefix}/verify_magic_link`, catchUnknownError(MainController.verifyMagicLink.bind(MainController)));
router.post(`${prefix}/login`, catchUnknownError(MainController.login.bind(MainController)));
router.post(`${prefix}/forgot_password`, catchUnknownError(MainController.forgotPassword.bind(MainController)));
router.patch(`${prefix}/reset_password/:token`, catchUnknownError(MainController.resetPassword.bind(MainController)));

// protected — requires guest JWT
router.get(`${prefix}/self`, guestAuth.protect, catchUnknownError(MainController.self.bind(MainController)));
router.patch(`${prefix}/set_password`, guestAuth.protect, catchUnknownError(MainController.setPassword.bind(MainController)));
router.patch(`${prefix}/regenerate_api_key`, guestAuth.protect, catchUnknownError(MainController.regenerateApiKey.bind(MainController)));
router.delete(`${prefix}/self_deactivate`, guestAuth.protect, catchUnknownError(MainController.selfDeactivate.bind(MainController)));

module.exports = router;
