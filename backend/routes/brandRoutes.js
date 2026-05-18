const express = require("express");
const { isAuth, isAdmin } = require("../config/auth");
const {
  addBrand,
  getAllBrands,
  getShowingBrands,
  getBrandById,
  updateBrand,
  updateBrandStatus,
  deleteBrand,
  deleteManyBrands,
} = require("../controller/brandController");

const router = express.Router();

router.post("/add", isAuth, isAdmin, addBrand);
router.get("/", getAllBrands);
router.get("/show", getShowingBrands);
router.get("/:id", getBrandById);
router.put("/:id", isAuth, isAdmin, updateBrand);
router.put("/status/:id", isAuth, isAdmin, updateBrandStatus);
router.delete("/:id", isAuth, isAdmin, deleteBrand);
router.patch("/delete/many", isAuth, isAdmin, deleteManyBrands);

module.exports = router;

