import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please add a name']
		},
		email: {
			type: String,
			required: [true, 'Please add an email'],
			unique: true,
			validate: [validator.isEmail, 'Please add a valid email']
		},
		password: {
			type: String,
			required: [true, 'Please add a password']
		}
	},
	{
		timestamps: true
	}
);

export default mongoose.model('User', userSchema);
