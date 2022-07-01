import Customer from '../models/customer.model.js';
import Order from '../models/order.model.js';
import { createError } from '../utils/createError.js';

const index = async (req, res) => {
	const customers = await Customer.find()
		.sort({ createdAt: -1 })
		.select('-__v')
		.populate('templates');
	res.status(200).json(customers);
};

const show = async (req, res, next) => {
	const id = req.params.id;

	const customer = await Customer.findById(id);

	if (!customer) {
		return next(createError(404, 'Customer Not Found'));
	}
	res.status(200).json(customer);

	// res.render("details", { title: "Details", customer });
};

const store = async (req, res, next) => {
	// res.status(200).json(req.body);
	const customer = await Customer.create({
		...req.body,
	});

	// res.json(req.body);

	// res.redirect("/customers");
	res.status(200).json(customer);
};

const update = async (req, res, next) => {
	const customer = await Customer.findOneAndUpdate(
		{ _id: req.params.id },
		{ $set: req.body },
		{ new: true, runValidators: true },
	);

	res.status(200).json(customer);
};

const destroy = async (req, res) => {
	const id = req.params.id;
	await Customer.findByIdAndDelete(id);
	res.json({ message: 'customer deleted' });
};

export { index, store, show, destroy, update };
