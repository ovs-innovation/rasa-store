const router = require("express").Router();
const { isAuth, isAdmin } = require("../config/auth");

const { getTaxes, addTax, deleteTax } = require("../controller/taxController");

router.get("/", getTaxes);
router.post("/add", isAuth, isAdmin, addTax);
router.delete("/:id", isAuth, isAdmin, deleteTax);

module.exports = router;
