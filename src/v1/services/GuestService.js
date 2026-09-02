const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Model = require('../models/GuestModel.js');
const BaseService = require('./BaseService');
const Email = require('../helpers/EmailHelper.js');

class GuestService extends BaseService {
	static className = 'GuestService';
	constructor() {
		super(Model);
		this.Model = Model;
		this.with_relation = false;
		this.relations = {};
	}

	async findByEmail(email) {
		const user = await this.Model.findOne({ email });
		if (!user) return false;
		return user;
	}

	async selfVerify(verification_token) {
		const user = await this.Model.findOne({ verification_token });
		if (!user) return false;
		user.verified_email = true;
		await user.save();
		return user;
	}

	async register({ name, email, usage }) {
		const user = await this.Model.create({ name, email, usage });
		if (!user) return false;

		const expiresInDays = parseInt(process.env.API_KEY_EXPIRES_DAYS) || 60;
		user.api_key = this.createApiKey();
		user.api_key_expires = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
		user.verification_token = this.createVerificationToken();
		await user.save();

		return user;
	}

	async sendVerificationEmail(email, name, token, api_key) {
		const activation_url = process.env.WEB_ORIGIN + '/verify-email?token=' + token;
		await new Email({ email, name }).sendVerificationEmail(token, api_key, activation_url);
		return true;
	}

	// --- magic link ---

	async sendMagicLink(email) {
		const guest = await this.Model.findOne({ email }).select('+password');

		if (!guest) return { found: false };

		if (!guest.verified_email) return { notVerified: true };

		if (guest.password) return { hasPassword: true };

		const rawToken = guest.createMagicLinkToken();
		await guest.save({ validateBeforeSave: false });

		const magic_url =
			process.env.WEB_ORIGIN + '/verify?token=' + rawToken;

		try {
			await new Email({ email, name: guest.name }).sendMagicLink(magic_url);
			return { sent: true };
		} catch {
			guest.magicLinkToken = undefined;
			guest.magicLinkExpires = undefined;
			await guest.save({ validateBeforeSave: false });
			return { emailFailed: true };
		}
	}

	async verifyMagicLink(rawToken) {
		const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

		const guest = await this.Model.findOne({
			magicLinkToken: hashedToken,
			magicLinkExpires: { $gt: Date.now() },
		});

		if (!guest) return false;

		guest.magicLinkToken = undefined;
		guest.magicLinkExpires = undefined;
		await guest.save({ validateBeforeSave: false });

		const token = this.createGuestToken(guest._id);
		return { guest, token };
	}

	// --- password login ---

	async login(email, password) {
		const guest = await this.Model.findOne({ email }).select('+password');
		if (!guest) return false;
		if (!guest.verified_email) return { notVerified: true };
		if (!guest.password) return { noPassword: true };

		const match = await guest.comparePassword(password, guest.password);
		if (!match) return false;

		const token = this.createGuestToken(guest._id);
		return { guest, token };
	}

	// --- set password (first time only) ---

	async setPassword(id, password) {
		const guest = await this.Model.findById(id).select('+password');
		if (!guest) return false;
		if (guest.password) return { alreadySet: true };

		guest._isFirstPasswordSet = true;
		guest.password = password;
		await guest.save();

		return true;
	}

	// --- forgot / reset password ---

	async forgotPassword(guest) {
		const rawToken = guest.createPasswordResetToken();

		try {
			await guest.save({ validateBeforeSave: false });

			const reset_url =
				process.env.WEB_ORIGIN + '/reset-password/' + rawToken;

			await new Email({ email: guest.email, name: guest.name }).sendGuestPasswordReset(reset_url);
			return true;
		} catch {
			guest.passwordResetToken = undefined;
			guest.passwordResetExpires = undefined;
			await guest.save({ validateBeforeSave: false });
			return false;
		}
	}

	async resetPassword(rawToken, password) {
		const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

		const guest = await this.Model.findOne({
			passwordResetToken: hashedToken,
			passwordResetExpires: { $gt: Date.now() },
		});

		if (!guest) return false;

		guest.password = password;
		guest.passwordResetToken = undefined;
		guest.passwordResetExpires = undefined;
		await guest.save();

		return true;
	}

	// --- api key regeneration ---

	async regenerateApiKey(id) {
		const guest = await this.Model.findById(id);
		if (!guest) return false;

		const expiresInDays = parseInt(process.env.API_KEY_EXPIRES_DAYS) || 60;
		guest.api_key = this.createApiKey();
		guest.api_key_expires = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
		await guest.save({ validateBeforeSave: false });

		return { api_key: guest.api_key, api_key_expires: guest.api_key_expires };
	}

	// --- deactivate ---

	async selfDeactivate(id) {
		const user = await this.Model.findByIdAndUpdate(id, { active: false });
		if (!user) return false;
		return true;
	}

	// --- token helpers ---

	createGuestToken(id) {
		return jwt.sign({ id, type: 'guest' }, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRES_IN,
		});
	}

	createApiKey() {
		return crypto.randomBytes(24).toString('hex');
	}

	createVerificationToken() {
		return uuidv4();
	}
}

module.exports = GuestService;
