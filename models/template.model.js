import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const templateSchema = new Schema(
	{
		product_id: {
			type: String,
		},
		customer_id: {
			type: String,
		},
		template: {
			type: String,
		},
		description: {
			type: String,
		},
	},
	{ timestamps: true },
);

const Template = mongoose.model('Template', templateSchema);

export default Template;
