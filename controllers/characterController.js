const Character = require("../models/character");
const { createError } = require("../utils/createError");
// var createError = require("http-errors");
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
		next(createError(404, "Not Found"));
		return;
	}
	res.status(200).json(character);

	// res.render("details", { title: "Details", character });
};

// @desc    Set character
// @route   POST /api/characters
// @access  Private
const store = async (req, res) => {
	const { name, body } = req.body;

	try {
		if (!name || !body) {
			throw new Error("Invalid Inputs");
		}
		const character = await Character.create({
			name,
			body,
		});
		// res.redirect("/characters");
		res.status(200).json(character);
	} catch (err) {
		console.log(err);
	}
};

// @desc    Update character
// @route   PUT /api/characters/:id
// @access  Private
const update = async (req, res) => {
	try {
		const character = await Character.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
			}
		);

		res.status(200).json(character);
	} catch (err) {
		res.status(400).json({ message: "Invalid Inputs" });
	}
};

// @desc    Delete character
// @route   DELETE /api/characters/:id
// @access  Private
const destroy = async (req, res) => {
	const id = req.params.id;

	try {
		await Character.findByIdAndDelete(id);
		res.json({ message: "character deleted" });
	} catch (err) {
		console.log(err);
	}
};

module.exports = {
	index,
	store,
	show,
	destroy,
	update,
};
