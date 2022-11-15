import { catchUnknownError } from '../middlewares/catchUnknownError.js';
import QueryBuilder from '../utils/queryBuilder.js';
import AppError from '../utils/appError.js';
import cloudinary from '../utils/cloudinary.js';

const paginatedResults = (totalDocuments, queryString, _query, data) => {
	const currentPage = queryString.page ? parseInt(queryString.page) : 1;
	const lastPage = Math.ceil(totalDocuments / _query.query.options.limit);
	const nextPage = currentPage + 1 > lastPage ? null : currentPage + 1;
	const previousPage = currentPage - 1 <= 0 ? null : currentPage - 1;
	const results = data.length;
	const from = _query.query.options.skip + 1;
	const to =
		from + _query.query.options.limit - 1 > totalDocuments
			? totalDocuments
			: from + _query.query.options.limit - 1;

	return {
		_paginate: {
			current_page: currentPage,
			next_page: nextPage,
			previous_page: previousPage,
			last_page: lastPage,
			per_page: _query.query.options.limit,
		},
		results: results,
		total: totalDocuments,
		from: from,
		to: to,
		data: data,
	};
};

const index = (Model, ...populateObject) =>
	catchUnknownError(async (req, res) => {
		let queryString = req.query;
		console.log(req.url);
		let _query = new QueryBuilder(Model.find(), queryString)
			.filter()
			.sort()
			.limitFields()
			.paginate();

		const data = populateObject
			? await _query.query.populate(populateObject)
			: await _query.query;

		const totalDocuments = _query.filteredData
			? await Model.countDocuments(_query.filteredData)
			: await Model.estimatedDocumentCount();

		const json = paginatedResults(
			totalDocuments,
			queryString,
			_query,
			data,
		);

		res.status(200).json(json);
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
