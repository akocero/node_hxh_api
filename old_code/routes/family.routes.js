import { Router } from 'express';
const router = Router();
import {
	index,
	store,
	update,
	show,
	destroy,
} from '../controllers/family.controller.js';
import { catchUnknownError } from '../middlewares/catchUnknownError.js';
import upload from '../utils/multer.js';

router.get('/', index);
router.get('/:id', catchUnknownError(show));
router.put('/:id', upload.single('image'), catchUnknownError(update));
router.post('/', upload.single('image'), catchUnknownError(store));
router.delete('/:id', catchUnknownError(destroy));

export default router;
