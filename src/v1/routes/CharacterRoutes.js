const express = require('express');
const auth = require('../middlewares/auth');
const api = require('../middlewares/api');

const router = express.Router();
const upload = require('../middlewares/multer.js');
const catchUnknownError = require('../utils/catchUnknownError.js');

const MainService = require('../services/CharacterService');
const _MainController = require('../controllers/CharacterController');

const MainController = new _MainController([MainService]);

const prefix = '/characters';

router.get(
	`${prefix}`,
	api.protect,
	catchUnknownError(MainController.readAll.bind(MainController)),
);

router.get(
	`${prefix}/:id`,
	api.protect,
	catchUnknownError(MainController.readOne.bind(MainController)),
);

router.patch(
	`${prefix}/:id`,
	express.json(),
	auth.protect,
	catchUnknownError(MainController.update.bind(MainController)),
);

router.post(
	`${prefix}`,
	express.json(),
	auth.protect,
	upload.single('image'), // you need to use this in order to accept data from formdata
	catchUnknownError(MainController.create.bind(MainController)),
);

router.delete(
	`${prefix}/:id`,
	auth.protect,
	auth.restrictedTo('admin'),
	catchUnknownError(MainController.delete.bind(MainController)),
);

module.exports = router;
