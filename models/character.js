const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const characterSchema = new Schema(
	{
		name: {
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
