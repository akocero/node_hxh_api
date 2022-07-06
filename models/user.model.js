import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please add a name'],
		},
		email: {
			type: String,
			required: [true, 'Please add an email'],
			unique: true,
			validate: [validator.isEmail, 'Please add a valid email'],
		},
		role: {
			type: String,
			enum: ['user'],
			default: 'user',
		},
		password: {
			type: String,
			required: [true, 'Please add a password'],
			select: false,
		},
	},
	{
		timestamps: true,
	},
);

userSchema.methods.correctPassword = async function (
	candidatePassword,
	userPassword,
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

export default mongoose.model('User', userSchema);
