const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const { createError } = require("../utils/createError");

const register = async (req, res, next) => {
	const { name, email, password } = req.body;

	if (!name || !email || !password) {
		return next(createError(400, "Please add all fields"));
	}

	// Check if user exists
	const userExists = await User.findOne({ email });

	if (userExists) {
		return next(createError(400, "User already exists"));
	}

	// Hash password
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	// Create user
	const user = await User.create({
		name,
		email,
		password: hashedPassword,
	});

	if (user) {
		res.status(201).json({
			_id: user.id,
			name: user.name,
			email: user.email,
			token: generateToken(user._id),
		});
	} else {
		return next(createError(400, "Invalid user data"));
	}
};

const login = async (req, res, next) => {
	const { email, password } = req.body;

	// Check for user email
	const user = await User.findOne({ email });

	if (user && (await bcrypt.compare(password, user.password))) {
		res.json({
			_id: user.id,
			name: user.name,
			email: user.email,
			token: generateToken(user._id),
		});
	} else {
		return next(createError(400, "Invalid credentials"));
	}
};

const me = async (req, res) => {
	res.status(200).json(req.user);
};

// Generate JWT
const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: "30d",
	});
};

module.exports = {
	register,
	login,
	me,
};
