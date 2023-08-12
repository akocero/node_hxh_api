const BaseController = require('./BaseController');
const AppError = require('../utils/appError.js');
const { jsonResponse } = require('../utils/responseBuilder');
const cloudinary = require('../../../config/cloudinary.js');

class ImageController extends BaseController {
	async create(req, res) {
		const BaseService = new this.BaseService();

		const image_res = await cloudinary.uploader.upload(req.file.path, {
			upload_preset:
				process.env.CLOUDINARY_IMAGE_PRESET || 'development_preset',
		});

		const data = await BaseService.create(...image_res);

		const statusCode = 200;
		res.status(statusCode).json(
			jsonResponse(statusCode, 'Resource created successfully.', data),
		);
		return;
	}

	async delete(req, res, next) {
		const id = req.params.id;
		const BaseService = new this.BaseService();

		const data = await BaseService.delete(id);

		if (!data) {
			return next(
				new AppError('The requested resource was not found', 404),
			);
		}

		// update related model if the image was deleted need to deleted also on other models
		// const ecomSet = await EcommSetting.updateMany(
		// 	{},
		// 	{
		// 		$pull: {
		// 			navbarBGs: id,
		// 			heros: id,
		// 		},
		// 	},
		// );

		// await EcommSetting.updateOne(
		// 	{
		// 		activeHero: id,
		// 	},
		// 	{
		// 		$unset: {
		// 			activeHero: '',
		// 		},
		// 	},
		// );

		await cloudinary.uploader.destroy(data.public_id);

		const statusCode = 200;

		res.status(statusCode).json(
			jsonResponse(
				statusCode,
				'Resource deleted successfully.',
				undefined,
			),
		);
		return;
	}
}

module.exports = ImageController;
