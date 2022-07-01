import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const templateSchema = new Schema(
	{
		customer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Customer',
		},
		product_id: {
			type: String,
		},
		body: {
			type: String,
		},
	},
	{ timestamps: true },
);

const Template = mongoose.model('Template', templateSchema);

export default Template;
