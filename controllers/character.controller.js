const Character = require("../models/characte.model");
const { createError } = require("../utils/createError");

const index = async (req, res) => {
	const characters = await Character.find()
		.sort({ createdAt: -1 })
		.populate("relatives", "name");
	res.status(200).json(characters);
};

const show = async (req, res, next) => {
	const id = req.params.id;

	const character = await Character.findById(id).populate(
		"relatives",
		"name"
	);

	if (!character) {
		return next(createError(404, "Character Not Found"));
	}
	res.status(200).json(character);

	// res.render("details", { title: "Details", character });
};

const store = async (req, res, next) => {
	const character = await Character.create({ ...req.body });
	// res.redirect("/characters");
	res.status(200).json(character);
};

const update = async (req, res, next) => {
	const character = await Character.findOneAndUpdate(
		{ _id: req.params.id },
		{ $set: req.body },
		{ new: true, runValidators: true }
	);

	res.status(200).json(character);
};

const destroy = async (req, res) => {
	const id = req.params.id;
	await Character.findByIdAndDelete(id);
	res.json({ message: "character deleted" });
};

module.exports = {
	index,
	store,
	show,
	destroy,
	update,
};
