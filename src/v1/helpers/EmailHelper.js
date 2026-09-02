const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const viewpath = path.join(__dirname, '../views/');

class Email {
	constructor(user, url) {
		this.to = user.email;
		this.name = user.name || user.email;
		this.url = url;
		this.from = process.env.EMAIL_FROM_NAME;
	}

	newTransport() {
		const transporter = nodemailer.createTransport({
			host: process.env.MAILTRAP_HOST,
			port: process.env.MAILTRAP_PORT,
			auth: {
				user: process.env.MAILTRAP_USERNAME,
				pass: process.env.MAILTRAP_PASSWORD,
			},
		});

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

	async execute(template, subject, context = {}) {
		if (process.env.NODE_ENV !== 'development') {
			const templatePath = path.join(viewpath, `${template}.handlebars`);
			const source = fs.readFileSync(templatePath, 'utf8');
			const compiled = Handlebars.compile(source);
			const html = compiled(context);

			const resend = new Resend(process.env.RESEND_API_KEY);
			await resend.emails.send({
				from: process.env.RESEND_FROM_EMAIL,
				to: this.to,
				subject,
				html,
			});
			return;
		}

		const mailOptions = {
			from: this.from,
			to: this.to,
			subject,
			template,
			context,
		};
		await this.newTransport().sendMail(mailOptions);
	}

	async sendPasswordReset(url) {
		const content = { name: this.to, url };
		await this.execute(
			'password_reset',
			'Your password reset token (valid for only 10 minutes)',
			content,
		);
	}

	async sendVerificationEmail(token, api_key, activation_url) {
		const content = { api_key, token, activation_url, name: this.name };
		await this.execute('verify_key', 'Api key verification', content);
	}

	async sendMagicLink(url) {
		const content = { name: this.name, url };
		await this.execute(
			'magic_link',
			'Your HXH API login link (valid for 15 minutes)',
			content,
		);
	}

	async sendGuestPasswordReset(url) {
		const content = { name: this.name, url };
		await this.execute(
			'guest_password_reset',
			'Reset your HXH API password (valid for 10 minutes)',
			content,
		);
	}
}

module.exports = Email;
