const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const isValidNenType = (val) => {
	const nen_types = [
		"enhancement",
		"manipulation",
		"emission",
		"specialization",
		"conjuration",
		"transmutation",
	];
	return nen_types.includes(val) ? true : false;
};

const characterSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			unique: [true, "Name already excist"],
		},
		nen_type: {
			type: String,
			validate: [isValidNenType, "Nen-type is not valid"],
		},
		abilities: {
			type: Array,
		},
		japanese_name: {
			type: String,
		},
		affiliations: {
			type: Array,
		},
		profession: {
			type: Array,
			required: [true, "Profession is required"],
		},
		state: {
			type: String,
			required: [true, "State is required"],
		},
		relatives: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Character",
			},
		],
		gender: {
			type: String,
			required: [true, "Gender is required"],
		},
		details: {
			type: String,
		},
	},
	{ timestamps: true }
);

const Character = mongoose.model("Character", characterSchema);

module.exports = Character;
