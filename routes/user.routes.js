const express = require("express");
const router = express.Router();
const { register, login, me } = require("../controllers/user.controller");
const { auth } = require("../middlewares/auth.js");
const { catchUnknownError } = require("../middlewares/catchUnknownError");

router.post("/register", catchUnknownError(register));
router.post("/login", catchUnknownError(login));
router.get("/me", auth, me);

module.exports = router;
