const express = require("express");
const router = express.Router();
const { isAuth, isAdmin } = require("../config/auth");
const {
  registerAdmin,
  loginAdmin,
  forgetPassword,
  resetPassword,
  addStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  updatedStatus,
  updateFcmToken,
} = require("../controller/adminController");
const { passwordVerificationLimit } = require("../lib/email-sender/sender");

//register a staff (only admin can register a new admin/staff)
router.post("/register", isAuth, isAdmin, registerAdmin);

//login a admin
router.post("/login", loginAdmin);

//forget-password
router.put("/forget-password", passwordVerificationLimit, forgetPassword);

//reset-password
router.put("/reset-password", resetPassword);

//add a staff
router.post("/add", isAuth, isAdmin, addStaff);

//get all staff
router.get("/", isAuth, isAdmin, getAllStaff);

//get a staff
router.post("/:id", isAuth, isAdmin, getStaffById);

//update a staff
router.put("/:id", isAuth, isAdmin, updateStaff);

//update staf status
router.put("/update-status/:id", isAuth, isAdmin, updatedStatus);

//delete a staff
router.delete("/:id", isAuth, isAdmin, deleteStaff);

// update fcm token
router.put("/update-fcm-token/:id", isAuth, isAdmin, updateFcmToken);

module.exports = router;
