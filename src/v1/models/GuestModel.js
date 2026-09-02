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
			required: [true, 'Usage is required'],
		},
		api_key: {
			type: String,
		},
		api_key_expires: {
			type: Date,
		},
		verification_token: {
			type: String,
			select: false,
		},
		verified_email: {
			type: Boolean,
			default: false,
		},
		password: {
			type: String,
			select: false,
		},
		passwordChangedAt: Date,
		magicLinkToken: String,
		magicLinkExpires: Date,
		passwordResetToken: String,
		passwordResetExpires: Date,
	},
	{
		timestamps: true,
	},
);

guestSchema.pre('save', async function (next) {
	if (!this.isModified('password') || !this.password) return next();

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

guestSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew || !this.password || this._isFirstPasswordSet) return next();
	this.passwordChangedAt = Date.now() - 1000;
	next();
});

guestSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

guestSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
		return JWTTimestamp < changedTimestamp;
	}
	return false;
};

guestSchema.methods.createMagicLinkToken = function () {
	const rawToken = crypto.randomBytes(32).toString('hex');
	this.magicLinkToken = crypto.createHash('sha256').update(rawToken).digest('hex');
	this.magicLinkExpires = Date.now() + 15 * 60 * 1000;
	return rawToken;
};

guestSchema.methods.createPasswordResetToken = function () {
	const rawToken = crypto.randomBytes(32).toString('hex');
	this.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
	return rawToken;
};

module.exports = mongoose.model('Guest', guestSchema);
