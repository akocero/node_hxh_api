import { catchUnknownError } from '../middlewares/catchUnknownError.js';
import QueryBuilder from '../utils/queryBuilder.js';
import AppError from '../utils/appError.js';
import cloudinary from '../utils/cloudinary.js';

const index = (Model, ...populateObject) =>
	catchUnknownError(async (req, res) => {
		let queryString = req.query;

		let _query = new QueryBuilder(Model.find(), queryString)
			.filter()
			.sort()
			.limitFields()
			.paginate();

		const data = populateObject
			? await _query.query.populate(populateObject)
			: await _query.query;

		// const data = await _query.query.populate(
		// 	'relatives.relative',
		// 	'name',
		// );
		res.status(200).json({
			status: 'success',
			results: data.length,
			data: data,
		});
	});

const store = (Model, uploadImage = false) =>
	catchUnknownError(async (req, res, next) => {
		const doc = await Model.create({
			...req.body,
		});

		// res.json(req.body);

		if (uploadImage && req.file && doc) {
			const image_res = await cloudinary.uploader.upload(req.file.path, {
				upload_preset: 'hxh-api',
			});
			doc.image = {
				public_id: image_res.public_id,
				secure_url: image_res.secure_url,
				width: image_res.width,
				height: image_res.height,
			};
			await doc.save();
		}

		// res.redirect("/docs");
		res.status(200).json({
			status: 'success',
			data: doc,
		});
	});

const show = (Model, ...populateObject) =>
	catchUnknownError(async (req, res, next) => {
		const id = req.params.id;
		const doc = populateObject
			? await Model.findById(id).select('-__v').populate(populateObject)
			: await Model.findById(id).select('-__v');

		// const doc = await Model.findById(id).populate('relatives', 'name');

		if (!doc) {
			return next(new AppError('No document found with that ID', 404));
		}

		// res.status(200).json(doc);

		res.status(200).json({
			status: 'success',
			data: doc,
		});
	});

const update = (Model, uploadImage = false) =>
	catchUnknownError(async (req, res, next) => {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});
		console.log(req.params.id);
		if (!doc) {
			return next(new AppError('No document found with that ID', 404));
		}

		if (uploadImage && req.file && doc && doc?.image?.public_id) {
			console.log(doc.image);
			await cloudinary.uploader.destroy(doc.image.public_id);
		}

		if (uploadImage && req.file && doc) {
			const image_res = await cloudinary.uploader.upload(req.file.path, {
				upload_preset: 'hxh-api',
			});

			doc.image = {
				public_id: image_res.public_id,
				secure_url: image_res.secure_url,
				width: image_res.width,
				height: image_res.height,
			};
			await doc.save();
		}

		res.status(200).json(doc);
	});

const destroy = (Model) =>
	catchUnknownError(async (req, res, next) => {
		const id = req.params.id;
		const doc = await Model.findByIdAndDelete(id);

		if (!doc) {
			return next(
				new AppError(`No document found with this ${id} ID`, 404),
			);
		}

		if (doc?.image?.public_id) {
			console.log(doc.image);
			await cloudinary.uploader.destroy(doc.image.public_id);
		}

		res.status(204).json({});
	});

export default { index, show, store, destroy, update };
