const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const guestSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			validate: [validator.isEmail, 'Please add a valid email'],
		},
		usage: {
			type: String,
			required: [true, 'UJsage is required'],
		},
		api_key: {
			type: String,
		},
		verification_token: {
			type: String,
		},
		verified_email: {
			type: Boolean,
			default: false,
			// select: false,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model('Guest', guestSchema);
