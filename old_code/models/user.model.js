import crypto from 'crypto';
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
			enum: ['user', 'admin'],
			default: 'user',
		},
		password: {
			type: String,
			required: [true, 'Please add a password'],
			select: false,
		},
		passwordConfirm: {
			type: String,
			required: [true, 'Please confirm your password'],
			validate: {
				// This only works on CREATE and SAVE!!!
				validator: function (el) {
					return el === this.password;
				},
				message: 'Passwords are not the same!',
			},
		},
		passwordChangedAt: Date,
		passwordResetToken: String,
		passwordResetExpires: Date,
		active: {
			type: Boolean,
			default: true,
			select: false,
		},
	},
	{
		timestamps: true,
	},
);

userSchema.pre('save', async function (next) {
	// Only run this function if password was actually modified
	if (!this.isModified('password')) return next();

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);

	// Delete passwordConfirm field before saving
	this.passwordConfirm = undefined;
	next();
});

userSchema.methods.comparePassword = async function (
	candidatePassword,
	userPassword,
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');

	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10,
		);

		return JWTTimestamp < changedTimestamp;
	}

	// False means NOT changed
	return false;
};

userSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew) return next();

	this.passwordChangedAt = Date.now() - 1000;
	next();
});

export default mongoose.model('User', userSchema);
