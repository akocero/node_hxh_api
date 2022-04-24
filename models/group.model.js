const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groupSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			unique: [true, "Name already excist"],
		},
		also_known_as: {
			type: Array,
		},
		image: {
			public_id: String,
			secure_url: String,
			width: Number,
			height: Number,
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
		status: {
			type: String,
		},
		classification: {
			type: String,
		},
		base_of_operations: {
			type: Array,
		},
		description: {
			type: String,
		},
	},
	{ timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
