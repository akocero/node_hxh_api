const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const characterSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, "Name Field is Required"],
		},
		nen_type: {
			type: String,
			required: true,
		},
		abilities: {
			type: Array,
			required: true,
		},
		japanese_name: {
			type: String,
			required: true,
		},
		affiliations: {
			type: Array,
			required: true,
		},

		profession: {
			type: String,
			required: true,
		},
		state: {
			type: String,
			required: true,
		},
		relatives: {
			type: String,
			required: true,
		},
		gender: {
			type: String,
			required: true,
		},
		body: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const Character = mongoose.model("Character", characterSchema);

module.exports = Character;
