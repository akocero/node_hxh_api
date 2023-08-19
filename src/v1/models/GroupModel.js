const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			unique: [true, 'Name already excist'],
		},
		also_known_as: {
			type: [String],
		},
		image: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Image',
			},
		],
		images: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Image',
			},
		],
		leaders: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Character',
			},
		],
		status: {
			type: String,
			enum: ['active', 'inactive'],
		},
		classification: {
			type: String,
			// Thieves, Hunters, Killers
		},
		details: {
			type: String,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Group', groupSchema);
