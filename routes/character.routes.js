const { Router } = require("express");
const router = Router();
const {
	index,
	store,
	update,
	show,
	destroy,
} = require("../controllers/character.controller");
const { catchUnknownError } = require("../middlewares/catchUnknownError");

router.get("/", index);
router.get("/:id", catchUnknownError(show));
router.put("/:id", catchUnknownError(update));
router.post("/", catchUnknownError(store));
router.delete("/:id", catchUnknownError(destroy));

module.exports = router;
