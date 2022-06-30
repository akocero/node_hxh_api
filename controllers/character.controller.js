import Character from '../models/character.model.js';
import { createError } from '../utils/createError.js';
import cloudinary from '../utils/cloudinary.js';

const index = async (req, res) => {
	const characters = await Character.find()
		.sort({ createdAt: -1 })
		.select('-createdAt -updatedAt -__v')
		.populate('relatives.relative', 'name');
	res.status(200).json({
		status: 200,
		results: characters.length,
		data: characters
	});
};

const show = async (req, res, next) => {
	const id = req.params.id;

	const character = await Character.findById(id).populate(
		'relatives',
		'name'
	);

	if (!character) {
		return next(createError(404, 'Character Not Found'));
	}
	res.status(200).json(character);

	// res.render("details", { title: "Details", character });
};

const store = async (req, res, next) => {
	const character = await Character.create({
		...req.body
	});

	// res.json(req.body);
	if (req.file && character) {
		const image_res = await cloudinary.uploader.upload(req.file.path, {
			upload_preset: 'hxh-api'
		});
		console.log(image_res);
		character.image = {
			public_id: image_res.public_id,
			secure_url: image_res.secure_url,
			width: image_res.width,
			height: image_res.height
		};
		await character.save();
	}

	// res.redirect("/characters");
	res.status(200).json(character);
};

const update = async (req, res, next) => {
	const character = await Character.findOneAndUpdate(
		{ _id: req.params.id },
		{ $set: req.body },
		{ new: true, runValidators: true }
	);

	if (req.file && character && character.image) {
		await cloudinary.uploader.destroy(character.image.public_id);
	}

	if (req.file && character) {
		const image_res = await cloudinary.uploader.upload(req.file.path, {
			upload_preset: 'hxh-api'
		});
		console.log(image_res);
		character.image = {
			public_id: image_res.public_id,
			secure_url: image_res.secure_url,
			width: image_res.width,
			height: image_res.height
		};
		await character.save();
	}

	res.status(200).json(character);
};

const destroy = async (req, res) => {
	const id = req.params.id;
	await Character.findByIdAndDelete(id);
	res.json({ message: 'character deleted' });
};

export { index, store, show, destroy, update };
