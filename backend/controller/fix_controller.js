const fs = require('fs');
const path = require('path');
const customerPath = path.join(__dirname, 'customerController.js');
let content = fs.readFileSync(path, 'utf8');

const correctImports = `require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Setting = require("../models/Setting");
const { signInToken, tokenForVerify } = require("../config/auth");
const { sendEmail } = require("../lib/email-sender/sender");
const { sendSMS } = require("../lib/sms-sender/sender");
const {
  customerRegisterBody,
  otpEmailBody,
} = require("../lib/email-sender/templates/register");
const {
  forgetPasswordEmailBody,
} = require("../lib/email-sender/templates/forget-password");
const { sendVerificationCode } = require("../lib/phone-verification/sender");

const verifyEmailAddress = async (req, res) => {
  const isAdded = await Customer.findOne({ email: req.body.email });
  if (isAdded) {
    return res.status(403).send({
      message: "This Email already Added!",
    });
  } else {
    const token = tokenForVerify(req.body);
    const globalSetting = await Setting.findOne({ name: "globalSetting" });
    const option = {
      name: req.body.name,
      email: req.body.email,
      contact_email: globalSetting?.setting?.email || "support@RASA.com",
      token: token,
      shop_name: globalSetting?.setting?.shop_name || "RASA",
    };
    const body = {
      to: \`\${req.body.email}\`,
      subject: "RASA – Verify your email",
      html: customerRegisterBody(option),
    };

    const message = "Please check your email to verify your account!";
    try {
      await sendEmail(body);
      res.send({ message });
    } catch (emailErr) {
      console.error("Email send failed (non-blocking):", emailErr.message || emailErr);
      res.status(200).send({ message, emailError: emailErr.message || String(emailErr) });
    }
  }
};

const verifyPhoneNumber = async (req, res) => {
  const phoneNumber = req.body.phone;

  if (!phoneNumber) {
    return res.status(400).send({
      message: "Phone number is required.",
    });
  }
`;

// Find where verifyPhoneNumber starts in the current messy file
// It currently looks like:
// 17: const { sendVerificationCode } = require("../lib/phone-verification/sender");
// 18:   //     message: "Invalid phone number format. Please provide a valid number.",
// 19:   //   });
// 20:   // }
// 21: 
// 22:   try {

// I'll just replace everything from the start until "try {" of verifyPhoneNumber
const matchStart = /require\("dotenv"\)[\s\S]*?try \{/;
const newContent = content.replace(matchStart, correctImports + '\n  try {');

fs.writeFileSync(path, newContent);
console.log('File fixed!');
