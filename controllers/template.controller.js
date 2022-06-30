import Template from '../models/template.model.js';
import { createError } from '../utils/createError.js';

const index = async (req, res) => {
	const templates = await Template.find()
		.sort({ createdAt: -1 })
		.select('-__v');
	res.status(200).json(templates);
};

const show = async (req, res, next) => {
	const id = req.params.id;

	const template = await Template.findById(id);

	if (!template) {
		return next(createError(404, 'Template Not Found'));
	}
	res.status(200).json(template);

	// res.render("details", { title: "Details", template });
};

const store = async (req, res, next) => {
	// res.status(200).json(req.body);
	const template = await Template.create({
		...req.body,
	});

	// res.json(req.body);

	// res.redirect("/templates");
	res.status(200).json(template);
};

const update = async (req, res, next) => {
	const template = await Template.findOneAndUpdate(
		{ _id: req.params.id },
		{ $set: req.body },
		{ new: true, runValidators: true },
	);

	res.status(200).json(template);
};

const destroy = async (req, res) => {
	const id = req.params.id;
	await Template.findByIdAndDelete(id);
	res.json({ message: 'template deleted' });
};

export { index, store, show, destroy, update };
