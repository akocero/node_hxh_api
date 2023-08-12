const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			unique: [true, 'Name already exist'],
		},
		description: {
			type: String,
		},
		coverPhoto: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Image',
			},
		],
		shopBanner: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Image',
			},
		],
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Collection', collectionSchema);
