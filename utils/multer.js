import multer from 'multer';
import path from 'path';

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
			cb(new Error('File type is not supported'), false);
			return;
		}
		cb(null, true);
	}
});
