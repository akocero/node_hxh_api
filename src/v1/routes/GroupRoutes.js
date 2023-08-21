const express = require('express');
const auth = require('../middlewares/auth');
const api = require('../middlewares/api');

const router = express.Router();
const upload = require('../middlewares/multer.js');
const catchUnknownError = require('../utils/catchUnknownError.js');

const MainService = require('../services/GroupService');
const _MainController = require('../controllers/GroupController');

const MainController = new _MainController([MainService]);

const prefix = '/groups';

router.get(
	`${prefix}`,
	api.protect,
	catchUnknownError(MainController.readAll.bind(MainController)),
);

// this random endpoint needs to be on the top of readOne route/endpoint
router.get(
	`${prefix}/random`,
	api.protect,
	catchUnknownError(MainController.readRandom.bind(MainController)),
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
