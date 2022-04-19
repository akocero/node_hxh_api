const { Router } = require("express");
const router = Router();
const {
	index,
	store,
	update,
	show,
	destroy,
} = require("../controllers/characterController");
const { catchUnknownError } = require("../middlewares/catchUnknownError");

router.get("/", index);
router.get("/:id", catchUnknownError(show));
router.put("/:id", update);
router.post("/", store);
router.delete("/:id", destroy);

module.exports = router;
