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
