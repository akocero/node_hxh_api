const express = require("express");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db");
const port = process.env.PORT || 5000;
const cors = require("cors");
const { errorHandler } = require("./middlewares/errorHandler");
// routes
const characterRoutes = require("./routes/character.routes");
const userRoutes = require("./routes/user.routes");

connectDB();

const app = express();
app.use(cors());

app.get("/", (req, res, next) => {
	res.status(200).json("welcome to hxh api");
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/characters", characterRoutes);
app.use("/api/auth", userRoutes);

app.use((req, res, next) => {
	const error = new Error("Not Found");
	error.status = 404;
	next(error);
});

app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));
