const { Router } = require("express");
const router = Router();
const {
	index,
	store,
	update,
	show,
	destroy,
} = require("../controllers/group.controller");
const { catchUnknownError } = require("../middlewares/catchUnknownError");
const upload = require("../utils/multer");

router.get("/", index);
router.get("/:id", catchUnknownError(show));
router.put("/:id", upload.single("image"), catchUnknownError(update));
router.post("/", upload.single("image"), catchUnknownError(store));
router.delete("/:id", catchUnknownError(destroy));

module.exports = router;
