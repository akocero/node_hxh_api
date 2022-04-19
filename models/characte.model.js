const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var { isEmail } = require("validator");

const isValidNenType = (val) => {
	const nen_types = ["enhancer", "manipulator", "conjurer"];
	console.log(val);
	return nen_types.includes(val) ? true : false;
};

const characterSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, "Name Field is Required"],
			validate: [isEmail, "please enter valid email"],
		},
		nen_type: {
			type: String,
			validate: [isValidNenType, "please add valid nen type"],
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
