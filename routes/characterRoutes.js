const { Router } = require("express");
const router = Router();
const {
	index,
	store,
	update,
	show,
	destroy,
} = require("../controllers/characterController");

router.get("/", index);
router.get("/:id", show);
router.put("/:id", update);
router.post("/", store);
router.delete("/:id", destroy);

module.exports = router;
