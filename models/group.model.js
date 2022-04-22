const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groupSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			unique: [true, "Name already excist"],
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
		description: {
			type: String,
		},
	},
	{ timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
