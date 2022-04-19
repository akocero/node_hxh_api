const Character = require("../models/characte.model");
const { createError } = require("../utils/createError");

// @desc    List characters
// @route   GET /api/characters
// @access  Private
const index = async (req, res) => {
	const characters = await Character.find().sort({ createdAt: -1 });
	res.status(200).json(characters);
};

// @desc    Single character
// @route   GET /api/characters/:id
// @access  Private
const show = async (req, res, next) => {
	const id = req.params.id;

	const character = await Character.findById(id);

	if (!character) {
		return next(createError(404, "Character Not Found"));
	}
	res.status(200).json(character);

	// res.render("details", { title: "Details", character });
};

// @desc    Set character
// @route   POST /api/characters
// @access  Private
const store = async (req, res, next) => {
	const character = await Character.create({ ...req.body });
	// res.redirect("/characters");
	res.status(200).json(character);
};

// @desc    Update character
// @route   PUT /api/characters/:id
// @access  Private
const update = async (req, res, next) => {
	const character = await Character.findByIdAndUpdate(
		req.params.id,
		req.body,
		{
			new: true,
		}
	);

	res.status(200).json(character);
};

// @desc    Delete character
// @route   DELETE /api/characters/:id
// @access  Private
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
