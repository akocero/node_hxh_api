import { Router } from 'express';
const router = Router();
import {
	register,
	login,
	me,
	forgotPassword,
	resetPassword,
	updatePassword,
	updateMe,
	deactivateMe,
} from '../controllers/auth.controller.js';
import auth from '../middlewares/auth.js';
import { catchUnknownError } from '../middlewares/catchUnknownError.js';

router.delete('/deactivateMe', auth.protect, catchUnknownError(deactivateMe));
router.patch('/updateMe', auth.protect, catchUnknownError(updateMe));
router.patch(
	'/updatePassword',
	auth.protect,
	catchUnknownError(updatePassword),
);
router.patch('/resetPassword/:token', catchUnknownError(resetPassword));

router.post('/forgotPassword', catchUnknownError(forgotPassword));
router.post('/register', catchUnknownError(register));
router.post('/login', catchUnknownError(login));

router.get('/me', auth.protect, me);

export default router;
