const express = require("express");
const router = express.Router();
const { isAuthOptional } = require("../../../config/auth");
const {
  paymentLimiter,
  getPhonePePublicStatus,
  createPhonePeCheckout,
  verifyPhonePePayment,
} = require("../controller/paymentController");

router.get("/phonepe/status", getPhonePePublicStatus);
router.post(
  "/phonepe/create",
  paymentLimiter,
  isAuthOptional,
  createPhonePeCheckout
);
router.post("/phonepe/verify", paymentLimiter, verifyPhonePePayment);
router.get("/phonepe/verify", paymentLimiter, verifyPhonePePayment);

module.exports = router;
