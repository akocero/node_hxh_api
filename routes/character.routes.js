import { Router } from 'express';
const router = Router();
import {
	index,
	store,
	update,
	show,
	destroy,
} from '../controllers/character.controller.js';
import { catchUnknownError } from '../middlewares/catchUnknownError.js';
import upload from '../utils/multer.js';
import { auth } from '../middlewares/auth.js';

router.get('/', index);
router.get('/:id', catchUnknownError(show));
router.put('/:id', auth, upload.single('image'), catchUnknownError(update));
router.post('/', auth, upload.single('image'), catchUnknownError(store));
router.delete('/:id', auth, catchUnknownError(destroy));

export default router;
