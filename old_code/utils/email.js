import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
	console.log(
		process.env.EMAIL_HOST,
		process.env.EMAIL_PORT,
		process.env.EMAIL_USERNAME,
		process.env.EMAIL_PASSWORD,
	);
	// 1) Create a transporter
	const transporter = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	// 2) Define the email options
	const mailOptions = {
		from: 'Eugene Badato <badatoeugenepaulm@gmail.com>',
		to: options.email,
		subject: options.subject,
		text: options.message,
		// html:
	};

	// 3) Actually send the email
	await transporter.sendMail(mailOptions);
};

export default sendEmail;
