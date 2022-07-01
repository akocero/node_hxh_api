import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const orderSchema = new Schema(
	{
		customer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Customer',
		},
		body: {
			type: String,
		},
	},
	{ timestamps: true },
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
