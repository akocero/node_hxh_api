const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const viewpath = path.join(__dirname, '../views/');

class Email {
	constructor(user, url) {
		this.to = user.email;
		this.url = url;
		this.from = process.env.EMAIL_FROM_NAME;
	}

	newTransport() {
		let transporter;
		if (process.env.NODE_ENV === 'development') {
			// Sendgrid
			transporter = nodemailer.createTransport({
				host: process.env.MAILTRAP_HOST,
				port: process.env.MAILTRAP_PORT,
				auth: {
					user: process.env.MAILTRAP_USERNAME,
					pass: process.env.MAILTRAP_PASSWORD,
				},
			});
		} else {
			transporter = nodemailer.createTransport({
				host: process.env.EMAIL_HOST,
				auth: {
					user: process.env.EMAIL_USERNAME,
					pass: process.env.EMAIL_PASSWORD,
				},
			});
		}

		const handlebarOptions = {
			viewEngine: {
				extName: '.handlebars',
				partialsDir: viewpath,
				defaultLayout: false,
			},
			viewPath: viewpath,
			extName: '.handlebars',
		};

		transporter.use('compile', hbs(handlebarOptions));

		return transporter;
	}

	// Send the actual email
	async execute(template, subject, context = {}) {
		// 2) Define email options
		const mailOptions = {
			from: this.from,
			to: this.to,
			subject,
			template,
			context,
		};
		// 3) Create a transport and send email
		await this.newTransport().sendMail(mailOptions);
	}

	async sendPasswordReset(url) {
		const content = { name: this.to, url };
		const subject = 'Your password reset token (valid for only 10 minutes)';
		const template = 'password_reset';
		await this.execute(template, subject, content);
	}

	async sendVerificationEmail(token, api_key, activation_url) {
		const content = {
			api_key,
			token,
			activation_url,
			name: this.to,
		};
		const subject = 'Api key verification';
		const template = 'verify_key';
		await this.execute(template, subject, content);
	}
}

module.exports = Email;
