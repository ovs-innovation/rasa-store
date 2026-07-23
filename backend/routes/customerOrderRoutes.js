const express = require("express");
const router = express.Router();
const {
  addOrder,
  getOrderById,
  getOrderCustomer,
  createPaymentIntent,
  addRazorpayOrder,
  createOrderByRazorPay,
  sendEmailInvoiceToCustomer,
} = require("../controller/customerOrderController");

const { emailVerificationLimit } = require("../lib/email-sender/sender");
const { isAuth, isAuthOptional } = require("../config/auth");

//add a order
router.post("/add", isAuthOptional, addOrder);

// create stripe payment intent
router.post("/create-payment-intent", isAuthOptional, createPaymentIntent);

//add razorpay order
router.post("/add/razorpay", isAuthOptional, addRazorpayOrder);

//add a order by razorpay
router.post("/create/razorpay", isAuthOptional, createOrderByRazorPay);

//get a order by id
router.get("/:id", isAuthOptional, getOrderById);

//get all order by a user
router.get("/", isAuth, getOrderCustomer);

//#send email invoice to customer
router.post(
  "/customer/invoice",
  isAuth,
  emailVerificationLimit,
  sendEmailInvoiceToCustomer
);

module.exports = router;
