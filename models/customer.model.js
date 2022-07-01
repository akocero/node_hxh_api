import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const customerSchema = new Schema(
	{
		customer_id: {
			type: String,
		},
		templates: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Template',
			},
		],
	},
	{ timestamps: true },
);

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
