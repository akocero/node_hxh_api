import { Router } from 'express';
const router = Router();
import {
	index,
	store,
	update,
	show,
	destroy,
} from '../controllers/customer.controller.js';
import { catchUnknownError } from '../middlewares/catchUnknownError.js';

router.get('/', index);
router.get('/:id', catchUnknownError(show));
router.put('/:id', catchUnknownError(update));
router.post('/', catchUnknownError(store));
router.delete('/:id', catchUnknownError(destroy));

export default router;
