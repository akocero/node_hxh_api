const express = require('express');
const auth = require('../middlewares/auth');

const router = express.Router();
const catchUnknownError = require('../utils/catchUnknownError.js');

const { GuestService: MainService } = require('../services/index');
const _MainController = require('../controllers/GuestController');

const MainController = new _MainController([MainService]);
const prefix = '/guest';

router.get(
	`${prefix}/self`,
	auth.protect,
	catchUnknownError(MainController.self.bind(MainController)),
);

router.get(
	`${prefix}/self_verify`,
	catchUnknownError(MainController.selfVerify.bind(MainController)),
);

router.post(
	`${prefix}/register`,
	express.json(),
	catchUnknownError(MainController.register.bind(MainController)),
);

router.delete(
	`${prefix}/self_deactivate`,
	express.json(),
	auth.protect,
	catchUnknownError(MainController.selfDeactivate.bind(MainController)),
);

module.exports = router;
