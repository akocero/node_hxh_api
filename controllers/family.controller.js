const Family = require("../models/family.model");
const { createError } = require("../utils/createError");
const cloudinary = require("../utils/cloudinary");

const index = async (req, res) => {
	const families = await Family.find()
		.sort({ createdAt: -1 })
		.select("-createdAt -updatedAt -__v")
		.populate("leaders.leader", "name");
	res.status(200).json(families);
};

const show = async (req, res, next) => {
	const id = req.params.id;

	const family = await Family.findById(id);

	if (!family) {
		return next(createError(404, "Family Not Found"));
	}
	res.status(200).json(family);

	// res.render("details", { title: "Details", family });
};

const store = async (req, res, next) => {
	// res.status(200).json(req.body);
	const family = await Family.create({
		...req.body,
	});

	// res.json(req.body);
	if (req.file && family) {
		const image_res = await cloudinary.uploader.upload(req.file.path, {
			upload_preset: "hxh-api",
		});

		family.image = {
			public_id: image_res.public_id,
			secure_url: image_res.secure_url,
			width: image_res.width,
			height: image_res.height,
		};
		await family.save();
	}

	// res.redirect("/families");
	res.status(200).json(family);
};

const update = async (req, res, next) => {
	const family = await Family.findOneAndUpdate(
		{ _id: req.params.id },
		{ $set: req.body },
		{ new: true, runValidators: true }
	);

	if (req.file && family && family.image) {
		await cloudinary.uploader.destroy(family.image.public_id);
	}

	if (req.file && family) {
		const image_res = await cloudinary.uploader.upload(req.file.path, {
			upload_preset: "hxh-api",
		});

		family.image = {
			public_id: image_res.public_id,
			secure_url: image_res.secure_url,
			width: image_res.width,
			height: image_res.height,
		};
		await family.save();
	}

	res.status(200).json(family);
};

const destroy = async (req, res) => {
	const id = req.params.id;
	await Family.findByIdAndDelete(id);
	res.json({ message: "family deleted" });
};

module.exports = {
	index,
	store,
	show,
	destroy,
	update,
};
