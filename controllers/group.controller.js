import Group from '../models/group.model.js';
import { createError } from '../utils/createError.js';
import cloudinary from '../utils/cloudinary.js';

const index = async (req, res) => {
	const groups = await Group.find()
		.sort({ createdAt: -1 })
		.select('-createdAt -updatedAt -__v')
		.populate('leaders.leader', 'name');
	res.status(200).json(groups);
};

const show = async (req, res, next) => {
	const id = req.params.id;

	const group = await Group.findById(id).populate('leaders.leader', 'name');

	if (!group) {
		return next(createError(404, 'Group Not Found'));
	}
	res.status(200).json(group);

	// res.render("details", { title: "Details", group });
};

const store = async (req, res, next) => {
	// res.status(200).json(req.body);
	const group = await Group.create({
		...req.body
	});

	// res.json(req.body);
	if (req.file && group) {
		const image_res = await cloudinary.uploader.upload(req.file.path, {
			upload_preset: 'hxh-api'
		});

		group.image = {
			public_id: image_res.public_id,
			secure_url: image_res.secure_url,
			width: image_res.width,
			height: image_res.height
		};
		await group.save();
	}

	// res.redirect("/groups");
	res.status(200).json(group);
};

const update = async (req, res, next) => {
	const group = await Group.findOneAndUpdate(
		{ _id: req.params.id },
		{ $set: req.body },
		{ new: true, runValidators: true }
	);

	if (req.file && group && group.image) {
		await cloudinary.uploader.destroy(group.image.public_id);
	}

	if (req.file && group) {
		const image_res = await cloudinary.uploader.upload(req.file.path, {
			upload_preset: 'hxh-api'
		});

		group.image = {
			public_id: image_res.public_id,
			secure_url: image_res.secure_url,
			width: image_res.width,
			height: image_res.height
		};
		await group.save();
	}

	res.status(200).json(group);
};

const destroy = async (req, res) => {
	const id = req.params.id;
	await Group.findByIdAndDelete(id);
	res.json({ message: 'group deleted' });
};

export { index, store, show, destroy, update };
