const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const familySchema = new Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			unique: [true, "Name already excist"],
		},
		leaders: [
			{
				leader: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Character",
				},
				leader_details: String,
			},
		],
		description: {
			type: String,
		},
	},
	{ timestamps: true }
);

const Family = mongoose.model("Family", familySchema);

module.exports = Family;