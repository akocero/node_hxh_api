import Order from '../models/order.model.js';
import { createError } from '../utils/createError.js';

const index = async (req, res) => {
	const orders = await Order.find()
		.sort({ createdAt: -1 })
		.select('-__v')
		.populate('customer');
	res.status(200).json(orders);
};

const show = async (req, res, next) => {
	const id = req.params.id;

	const order = await Order.findById(id);

	if (!order) {
		return next(createError(404, 'Order Not Found'));
	}
	res.status(200).json(order);

	// res.render("details", { title: "Details", order });
};

const store = async (req, res, next) => {
	// res.status(200).json(req.body);
	const order = await Order.create({
		...req.body,
	});

	// res.json(req.body);

	// res.redirect("/orders");
	res.status(200).json(order);
};

const update = async (req, res, next) => {
	const order = await Order.findOneAndUpdate(
		{ _id: req.params.id },
		{ $set: req.body },
		{ new: true, runValidators: true },
	);

	res.status(200).json(order);
};

const destroy = async (req, res) => {
	const id = req.params.id;
	await Order.findByIdAndDelete(id);
	res.json({ message: 'order deleted' });
};

export { index, store, show, destroy, update };
