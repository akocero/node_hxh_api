import multer from 'multer';
import path from 'path';
import AppError from './appError.js';

// Multer config
export default multer({
	storage: multer.diskStorage({}),
	fileFilter: (req, file, cb) => {
		let ext = path.extname(file.originalname);
		if (
			ext !== '.jpg' &&
			ext !== '.jpeg' &&
			ext !== '.png' &&
			ext !== '.webp'
		) {
			cb(new AppError('File type is not supported', 400), false);
			return;
		}
		cb(null, true);
	},
});
