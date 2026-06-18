const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    shippingAddress: [{
      name: { type: String, required: false },
      address: { type: String, required: false },
      city: { type: String, required: false },
      country: { type: String, required: false },
      zipCode: { type: String, required: false },
      phone: { type: String, required: false },
      isDefault: { type: Boolean, default: false },
      addressType: {
        type: String,
        enum: ['Home', 'Work', 'Other'],
        default: 'Home',
      },
    }],
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    profileComplete: {
      type: Boolean,
      default: false,
    },
    authProvider: {
      type: String,
      default: "email",
    },
    password: {
      type: String,
      required: false,
    },
    lastLogin: {
      type: Date,
      required: false,
    },
    blocked: {
      type: Boolean,
      required: false,
      default: false,
    },
    cart: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    fcmToken: {
      type: String,
      required: false,
    },
    pendingEmail: {
      type: String,
      required: false,
      lowercase: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationOtp: {
      type: String,
      required: false,
    },
    emailVerificationExpires: {
      type: Date,
      required: false,
    },
    loginOtp: {
      type: String,
      required: false,
    },
    loginOtpExpires: {
      type: Date,
      required: false,
    },
    loginOtpAttempts: {
      type: Number,
      default: 0,
    },
    lastLoginOtpSentAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
