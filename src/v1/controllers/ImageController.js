const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const BaseController = require('./BaseController');
const AppError = require('../utils/appError.js');
const { jsonResponse } = require('../utils/responseBuilder');
const r2 = require('../../../config/r2.js');

class ImageController extends BaseController {
	async create(req, res, next) {
		if (!req.file) {
			return next(new AppError('File is required', 400));
		}
		const BaseService = new this.BaseService();

		const key = `${uuidv4()}${path.extname(req.file.originalname)}`;

		await r2.send(
			new PutObjectCommand({
				Bucket: process.env.R2_BUCKET_NAME,
				Key: key,
				Body: req.file.buffer,
				ContentType: req.file.mimetype,
			}),
		);

		const public_id = key;
		const secure_url = `${process.env.R2_PUBLIC_URL}/${key}`;

		const data = await BaseService.create({ public_id, secure_url });

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

		await r2.send(
			new DeleteObjectCommand({
				Bucket: process.env.R2_BUCKET_NAME,
				Key: data.public_id,
			}),
		);

		const statusCode = 200;
		res.status(statusCode).json(
			jsonResponse(statusCode, 'Resource deleted successfully.', undefined),
		);
		return;
	}
}

module.exports = ImageController;
