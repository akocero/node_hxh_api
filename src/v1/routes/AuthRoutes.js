const express = require('express');
const auth = require('../middlewares/auth');

const router = express.Router();
const catchUnknownError = require('../utils/catchUnknownError.js');

const { AuthService: MainService } = require('../services/index');
const _MainController = require('../controllers/AuthController');

const MainController = new _MainController([MainService]);
const prefix = '/auth';

router.get(
	`${prefix}/self`,
	auth.protect,
	catchUnknownError(MainController.self.bind(MainController)),
);

router.post(
	`${prefix}/login`,
	catchUnknownError(MainController.login.bind(MainController)),
);

router.post(
	`${prefix}/register`,
	catchUnknownError(MainController.register.bind(MainController)),
);

router.patch(
	`${prefix}/update_password`,
	auth.protect,
	catchUnknownError(MainController.updatePassword.bind(MainController)),
);
router.post(
	`${prefix}/forgot_password`,
	catchUnknownError(MainController.forgotPassword.bind(MainController)),
);

router.patch(
	`${prefix}/reset_password/:token`,
	catchUnknownError(MainController.resetPassword.bind(MainController)),
);

router.patch(
	`${prefix}/self_update`,
	auth.protect,
	catchUnknownError(MainController.selfUpdate.bind(MainController)),
);

router.delete(
	`${prefix}/self_deactivate`,
	auth.protect,
	catchUnknownError(MainController.selfDeactivate.bind(MainController)),
);

module.exports = router;
