/**
 * to use this run this command
 * node dev-data/manual_modify_data.js [action]
 * sample: node dev-data/manual_modify_data.js --emptyImageAllItems
 */

const mongoose = require('mongoose');
require('dotenv').config();
const Item = require('../models/item.model.js');
const Order = require('../models/order.model.js');
const Image = require('../models/image.model.js');

console.log(process.env.MONGODB_URI);

// !this code is to remove a field in document
// !It will permanently deleted the field in every document

// query to remove a field in this example i remove coverPhoto
// {}, { $unset: { coverPhoto: '' } }

// * to get the specific model to unset a field
// if (req.baseUrl.includes('items')) {
// * this scripts is to unset or removed the field
// * in this example, I removed the categories field
// console.log(await Model.updateMany([{ $unset: 'categories' }]));
//}

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGODB_URI);

		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};

connectDB();

const emptyImageAllItems = async () => {
	try {
		const res = await Item.updateMany({}, { $unset: { coverPhoto: '' } });
		console.log(res, 'Succesfully Empty Image All Data!');
		process.exit();
	} catch (error) {
		console.log(error);
	}
};

const unPublishedAllItems = async () => {
	try {
		await Item.updateMany({}, { $set: { isPublished: 0 } });
		console.log('Succesfully Unublished All Data!');
		process.exit();
	} catch (error) {
		console.log(error);
	}
};

const pendingAllOrders = async () => {
	try {
		await Order.updateMany({}, { $set: { status: 'pending' } });
		console.log('Succesfully Pending All Orders!');
		process.exit();
	} catch (error) {
		console.log(error);
	}
};

const publishedAllItems = async () => {
	console.log('publishedAllItems Invoked');
	try {
		await Item.updateMany({}, { $set: { isPublished: 1 } });
		console.log('Succesfully Published All Data!');
		process.exit();
	} catch (error) {
		console.log(error);
	}
};

const deleteAllOrders = async () => {
	try {
		await Order.deleteMany();
		//   await User.deleteMany();
		//   await Review.deleteMany();
		console.log('Data successfully deleted!');
	} catch (err) {
		console.log(err);
	}
	process.exit();
};

const deleteAllImageData = async () => {
	try {
		await Image.deleteMany();
		//   await User.deleteMany();
		//   await Review.deleteMany();
		console.log('Data successfully deleted!');
	} catch (err) {
		console.log(err);
	}
	process.exit();
};
// to check agrument variables
console.log(process.argv);

const actions = [
	{
		name: 'publishedAllItems',
		func: () => {
			publishedAllItems();
		},
	},
	{
		name: 'unPublishedAllItems',
		func: () => {
			unPublishedAllItems();
		},
	},
	{
		name: 'deleteAllOrders',
		func: () => {
			deleteAllOrders();
		},
	},
	{
		name: 'pendingAllOrders',
		func: () => {
			pendingAllOrders();
		},
	},
	{
		name: 'emptyImageAllItems',
		func: () => {
			emptyImageAllItems();
		},
	},
	{
		name: 'deleteAllImageData',
		func: () => {
			deleteAllImageData();
		},
	},
];

function invokeFunction(actionName) {
	actions.forEach((action) => {
		if ('--' + action.name === actionName) {
			action.func();
		}
	});
}

invokeFunction(process.argv[2]);
