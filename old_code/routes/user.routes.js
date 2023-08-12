import { Router } from 'express';
const router = Router();
import { index } from '../controllers/user.controller.js';
import auth from '../middlewares/auth.js';
import { catchUnknownError } from '../middlewares/catchUnknownError.js';

router.get(
	'/',
	auth.protect,
	auth.restrictedTo('admin'),
	catchUnknownError(index),
);

export default router;
