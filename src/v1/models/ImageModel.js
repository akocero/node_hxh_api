const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema(
	{
		public_id: {
			type: String,
			required: [true, 'Public ID is required'],
			unique: [true, 'Public ID already exist'],
		},
		secure_url: {
			type: String,
			required: [true, 'Secure URL required'],
			unique: [true, 'Secure URL already exist'],
		},
		width: {
			type: Number,
		},
		height: {
			type: Number,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model('Image', imageSchema);
