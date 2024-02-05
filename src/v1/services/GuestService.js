const Model = require('../models/GuestModel.js');
const BaseService = require('./BaseService');
const jwt = require('jsonwebtoken');
const Email = require('../helpers/EmailHelper.js');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

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

		if (!user) {
			return false;
		}

		return user;
	}

	async selfVerify(verification_token) {
		const user = await this.Model.findOne({ verification_token });

		if (!user) {
			return false;
		}

		user.verified_email = true;
		await user.save();
		return user;
	}

	async register({ name, email, usage }) {
		const user = await this.Model.create({
			name,
			email,
			usage,
		});

		if (!user) {
			return false;
		}

		const api_key = this.createApiKey(user._id);
		const verification_token = this.createVerificationToken();

		user.api_key = api_key;
		user.verification_token = verification_token;

		await user.save();

		return user;
	}

	async sendVerificationEmail(email, token, api_key) {
		const activation_url =
			process.env.WEB_ORIGIN + '/api/v1/guest/self_verify?token=' + token;
		await new Email({ email }).sendVerificationEmail(
			token,
			api_key,
			activation_url,
		);
		return true;
	}

	async selfDeactivate(id) {
		const user = await this.Model.findByIdAndUpdate(id, { active: false });

		if (!user) {
			return false;
		}

		return true;
	}

	createApiKey(id) {
		return jwt.sign({ id }, process.env.JWT_API_SECRET, {
			expiresIn: process.env.JWT_API_EXPIRES_IN,
		});
	}

	createVerificationToken() {
		return uuidv4();
	}
}

module.exports = GuestService;
