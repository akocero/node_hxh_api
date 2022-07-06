import { Router } from 'express';
const router = Router();
import { register, login, me } from '../controllers/user.controller.js';
import auth from '../middlewares/auth.js';
import { catchUnknownError } from '../middlewares/catchUnknownError.js';

router.post('/register', catchUnknownError(register));
router.post('/login', catchUnknownError(login));
router.get('/me', auth.protect, me);

export default router;
