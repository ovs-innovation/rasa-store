require("dotenv").config();
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
  loginOtpEmailBody,
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
      contact_email: globalSetting?.setting?.email || "support@farmacykart.com",
      token: token,
      shop_name: globalSetting?.setting?.shop_name || "Farmacykart",
    };
    const body = {
      from: globalSetting?.setting?.email || process.env.EMAIL_USER,
      to: `${req.body.email}`,
      subject: "Verify Your Email",
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

  try {
    // Check if the phone number is already associated with an existing customer
    const isAdded = await Customer.findOne({ phone: phoneNumber });

    if (isAdded) {
      return res.status(403).send({
        message: "This phone number is already added.",
      });
    }

    // Generate a random 6-digit verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Send verification code via SMS
    const sent = await sendVerificationCode(phoneNumber, verificationCode);

    if (!sent) {
      return res.status(500).send({
        message: "Failed to send verification code.",
      });
    }

    const message = "Please check your phone for the verification code!";
    return res.send({ message });
  } catch (err) {
    console.error("Error during phone verification:", err);
    res.status(500).send({
      message: err.message,
    });
  }
};

const sendPhoneEmailOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).send({ message: "Phone number is required." });
    }

    // Find user by phone (allowing for full number or last 10 digits)
    const user = await Customer.findOne({
      $or: [
        { phone: phoneNumber },
        { phone: phoneNumber.slice(-10) }
      ]
    });

    if (!user) {
      return res.status(404).send({
        message: "Account with this phone number does not exist. Please register first.",
        error: "USER_NOT_FOUND",
      });
    }

    // Check resend cooldown (60 seconds)
    if (user.lastLoginOtpSentAt && (Date.now() - user.lastLoginOtpSentAt < 60 * 1000)) {
      const remainingSeconds = Math.ceil(60 - (Date.now() - user.lastLoginOtpSentAt) / 1000);
      return res.status(429).send({
        message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
      });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOtp = bcrypt.hashSync(otp, 10);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.loginOtp = hashedOtp;
    user.loginOtpExpires = otpExpires;
    user.loginOtpAttempts = 0; // Reset attempts on new OTP request
    user.lastLoginOtpSentAt = new Date();
    await user.save();

    // Send OTP to registered email
    const globalSetting = await Setting.findOne({ name: "globalSetting" });
    const option = {
      name: user.name,
      email: user.email,
      otp: otp,
      contact_email: globalSetting?.setting?.email || "support@farmacykart.com",
      shop_name: globalSetting?.setting?.shop_name || "Farmacykart",
    };

    const body = {
      from: globalSetting?.setting?.email || process.env.EMAIL_USER,
      to: user.email,
      subject: "Your Login OTP - Farmacykart",
      html: loginOtpEmailBody(option),
    };

    await sendEmail(body);

    res.send({
      message: `OTP sent successfully to your registered email: ${user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")}`,
      email: user.email, // Frontend can use this to show where it was sent
    });

  } catch (err) {
    console.error("sendPhoneEmailOTP error:", err);
    res.status(500).send({ message: err.message });
  }
};

const verifyPhoneEmailOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).send({ message: "Phone number and OTP are required." });
    }

    const user = await Customer.findOne({
      $or: [
        { phone: phoneNumber },
        { phone: phoneNumber.slice(-10) }
      ]
    });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Check if OTP exists and is not expired
    if (!user.loginOtp || !user.loginOtpExpires || new Date() > user.loginOtpExpires) {
      return res.status(400).send({ message: "OTP has expired or not found. Please request a new one." });
    }

    // Check attempt limits
    if (user.loginOtpAttempts >= 5) {
      return res.status(403).send({ message: "Too many failed attempts. Please request a new OTP." });
    }

    // Verify OTP
    const isMatch = bcrypt.compareSync(otp, user.loginOtp);

    if (!isMatch) {
      user.loginOtpAttempts += 1;
      await user.save();
      return res.status(400).send({ message: "Invalid OTP code." });
    }

    // Success! Clear OTP fields
    user.loginOtp = undefined;
    user.loginOtpExpires = undefined;
    user.loginOtpAttempts = 0;
    user.lastLogin = new Date();
    await user.save();

    // Fetch user with cart to return complete profile
    const customerWithCart = await Customer.findById(user._id).populate({
      path: "cart.productId",
      select: "title prices image slug",
    });

    const token = signInToken(customerWithCart);
    res.send({
      token,
      _id: customerWithCart._id,
      name: customerWithCart.name,
      email: customerWithCart.email,
      phone: customerWithCart.phone,
      address: customerWithCart.address || "",
      image: customerWithCart.image || "",
      role: customerWithCart.role || "customer",
      cart: customerWithCart.cart,
      message: "Login Successful!",
    });

  } catch (err) {
    console.error("verifyPhoneEmailOTP error:", err);
    res.status(500).send({ message: err.message });
  }
};

const loginWithPhone = async (req, res) => {
  // Keeping this for potential legacy or external use, but marking as deprecated if needed.
  // Actually, I'll just keep it but the new flow won't use it.
  try {
    const { phoneNumber, idToken } = req.body;

    if (!phoneNumber) {
      return res.status(400).send({
        message: "Phone number is required.",
      });
    }

    if (!idToken) {
      return res.status(400).send({
        message: "Firebase ID token is required.",
      });
    }

    // Verify Firebase ID Token
    let decodedToken;
    try {
      const admin = require("../config/firebase-admin");
      if (admin.apps.length > 0) {
        decodedToken = await admin.auth().verifyIdToken(idToken);
        const firebasePhone = decodedToken.phone_number;

        // Security check: ensure the token belongs to the phone number being logged in
        if (firebasePhone !== phoneNumber) {
          return res.status(401).send({
            message: "Token phone number mismatch. Verification failed.",
          });
        }
      } else {
        console.warn("Firebase Admin not initialized, skipping token verification (Insecure).");
      }
    } catch (verifyErr) {
      console.error("Firebase ID Token verification failed:", verifyErr);
      return res.status(401).send({
        message: "Invalid or expired Firebase token.",
      });
    }

    let user = await Customer.findOne({
      $or: [
        { phone: phoneNumber },
        { phone: phoneNumber.slice(-10) }
      ]
    });

    if (!user) {
      return res.status(404).send({
        message: "Account with this phone number does not exist. Please register first.",
        error: "USER_NOT_FOUND",
      });
    }

    const token = signInToken(user);
    res.send({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address || "",
      image: user.image || "",
      message: "Login Successful!",
      role: user.role || "customer",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const registerCustomer = async (req, res) => {
  const token = req.params.token;

  try {
    const { name, email, password } = jwt.decode(token);

    // Check if the user is already registered
    const isAdded = await Customer.findOne({ email });

    if (isAdded) {
      const token = signInToken(isAdded);
      return res.send({
        token,
        _id: isAdded._id,
        name: isAdded.name,
        email: isAdded.email,
        password: password,
        role: isAdded.role || "customer",
        message: "Email Already Verified!",
      });
    }

    if (token) {
      jwt.verify(
        token,
        process.env.JWT_SECRET_FOR_VERIFY || "fallback_jwt_verify_secret",
        async (err, decoded) => {
          if (err) {
            return res.status(401).send({
              message: "Token Expired, Please try again!",
            });
          }

          // Create a new user only if not already registered
          const existingUser = await Customer.findOne({ email });
          console.log("existingUser");

          if (existingUser) {
            return res.status(400).send({ message: "User already exists!" });
          } else {
            const newUser = new Customer({
              name,
              email,
              password: bcrypt.hashSync(password),
            });

            await newUser.save();
            const token = signInToken(newUser);
            res.send({
              token,
              _id: newUser._id,
              name: newUser.name,
              email: newUser.email,
              role: newUser.role || "customer",
              message: "Email Verified, Please Login Now!",
            });
          }
        }
      );
    }
  } catch (error) {
    console.error("Error during email verification:", error);
    res.status(500).send({
      message: "Internal server error. Please try again later.",
    });
  }
};

const registerCustomerDirect = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Optional: block disposable email domains
    const disposableDomains = [
      "tempmail.com", "mailinator.com", "yopmail.com", "10minutemail.com",
      "temp-mail.org", "guerrillamail.com", "sharklasers.com", "dispostable.com"
    ];
    const domain = email?.split("@")[1];
    if (domain && disposableDomains.includes(domain)) {
      return res.status(400).send({
        message: "Disposable email addresses are not allowed. Please use a real email.",
      });
    }

    const isAdded = await Customer.findOne({ $or: [{ email }, { phone }] });

    if (isAdded) {
      return res.status(403).send({
        message: "Email or Phone is already in use!",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString(); const otpExpires = new Date(Date.now() + 15 * 60 * 1000);



    const newUser = new Customer({
      name,
      email,
      phone,
      password: bcrypt.hashSync(password),
      role: "customer",
      emailVerified: false, emailVerificationOtp: otp, emailVerificationExpires: otpExpires,


    });

    await newUser.save();

    // Send OTP Email
    try {
      const globalSetting = await Setting.findOne({ name: "globalSetting" });
      const option = {
        name: newUser.name,
        email: newUser.email,
        otp: otp,
        contact_email: globalSetting?.setting?.email || "support@farmacykart.com",
        shop_name: globalSetting?.setting?.shop_name || "Farmacykart",
      };

      const body = {
        from: globalSetting?.setting?.email || process.env.EMAIL_USER,
        to: newUser.email,
        subject: "Verify Your Email - OTP",
        html: otpEmailBody(option),
      };

      await sendEmail(body);
    } catch (emailErr) {
      console.error("Signup Email Error:", emailErr);
    }

    res.send({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      message: "Registration Successful!",
      requiresVerification: true,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const verifyEmailOTP = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;
    const user = await Customer.findOne({ $or: [{ email: email || "___" }, { phone: phone || "___" }] });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    if (user.emailVerified) {
      return res.status(400).send({ message: "Email is already verified." });
    }

    if (user.emailVerificationOtp !== otp) {
      return res.status(400).send({ message: "Invalid OTP code." });
    }

    if (new Date() > user.emailVerificationExpires) {
      return res.status(400).send({ message: "OTP has expired. Please request a new one." });
    }

    user.emailVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const token = signInToken(user);
    res.send({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      message: "Email verified successfully! You are now logged in.",
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Customer.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    if (user.emailVerified) {
      return res.status(400).send({ message: "Email is already verified." });
    }

    // Generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    user.emailVerificationOtp = otp;
    user.emailVerificationExpires = otpExpires;
    await user.save();

    const globalSetting = await Setting.findOne({ name: "globalSetting" });
    const option = {
      name: user.name,
      email: user.email,
      otp: otp,
      contact_email: globalSetting?.setting?.email || "support@farmacykart.com",
      shop_name: globalSetting?.setting?.shop_name || "Farmacykart",
    };

    const body = {
      from: globalSetting?.setting?.email || process.env.EMAIL_USER,
      to: user.email,
      subject: "Your New Verification OTP",
      html: otpEmailBody(option),
    };

    await sendEmail(body);
    res.send({ message: "A new OTP has been sent to your email." });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Create wholesaler from frontend form - accepts URLs (preferred) or multipart files
const createWholesaler = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const gstNotRequired = req.body.gstNotRequired === 'true' || req.body.gstNotRequired === true || req.body.gstNotRequired === 'on';
    const drugLicenseNotRequired = req.body.drugLicenseNotRequired === 'true' || req.body.drugLicenseNotRequired === true || req.body.drugLicenseNotRequired === 'on';

    if (!name || !email) {
      return res.status(400).send({ message: 'Name and email are required.' });
    }

    // check if email exists
    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(400).send({ message: 'Customer with this email already exists.' });
    }

    const files = req.files || {};

    // Basic URL validator
    const isValidUrl = (value) => {
      if (!value) return false;
      try {
        const u = new URL(value);
        return ['http:', 'https:'].includes(u.protocol);
      } catch (e) {
        return false;
      }
    };

    const resolveField = (bodyKey, fileKey) => {
      const bodyVal = req.body[bodyKey] && String(req.body[bodyKey]).trim();
      if (bodyVal) {
        if (!isValidUrl(bodyVal)) {
          return { error: `${bodyKey} must be a valid URL.` };
        }
        return { url: bodyVal };
      }
      if (files[fileKey] && files[fileKey][0]) {
        return { url: `/uploads/wholesaler/${files[fileKey][0].filename}` };
      }
      return { url: null };
    };

    const aadharRes = resolveField('aadharUrl', 'aadhar');
    if (aadharRes.error) return res.status(400).send({ message: aadharRes.error });

    const panRes = resolveField('panUrl', 'pan');
    if (panRes.error) return res.status(400).send({ message: panRes.error });

    const gstRes = resolveField('gstUrl', 'gst');
    if (gstRes.error) return res.status(400).send({ message: gstRes.error });

    const drugRes = resolveField('drugUrl', 'drugLicense');
    if (drugRes.error) return res.status(400).send({ message: drugRes.error });

    // Required validations — only name and email are mandatory from frontend signup
    // (Aadhar/PAN are optional per the updated form)

    const newWholesaler = new Customer({
      name,
      email,
      phone,
      role: 'wholesaler',
      password: req.body.password ? bcrypt.hashSync(req.body.password) : undefined,
      aadhar: aadharRes.url,
      aadharPublicId: req.body.aadharPublicId || (files.aadhar && files.aadhar[0] ? files.aadhar[0].filename.split('.').slice(0, -1).join('.') : null),
      aadharDeleteToken: req.body.aadharDeleteToken || null,
      pan: panRes.url,
      panPublicId: req.body.panPublicId || (files.pan && files.pan[0] ? files.pan[0].filename.split('.').slice(0, -1).join('.') : null),
      panDeleteToken: req.body.panDeleteToken || null,
      gst: gstRes.url,
      gstPublicId: req.body.gstPublicId || (files.gst && files.gst[0] ? files.gst[0].filename.split('.').slice(0, -1).join('.') : null),
      gstDeleteToken: req.body.gstDeleteToken || null,
      drugLicense: drugRes.url,
      drugLicensePublicId: req.body.drugPublicId || (files.drugLicense && files.drugLicense[0] ? files.drugLicense[0].filename.split('.').slice(0, -1).join('.') : null),
      drugLicenseDeleteToken: req.body.drugDeleteToken || null,
      gstNotRequired,
      drugLicenseNotRequired,
      wholesalerStatus: 'pending',
      // New shop fields from updated signup form
      hasShop: req.body.hasShop === true || req.body.hasShop === 'true' || false,
      shopName: req.body.shopName || null,
      gstNumber: req.body.gstNumber || null,
      drugLicenseNumber: req.body.drugLicenseNumber || null,
      shopImageUrl: req.body.shopImageUrl || null,
      shopImagePublicId: req.body.shopImagePublicId || null,
      shopImageDeleteToken: req.body.shopImageDeleteToken || null,
      businessDocUrl: req.body.businessDocUrl || null,
      businessDocPublicId: req.body.businessDocPublicId || null,
      businessDocDeleteToken: req.body.businessDocDeleteToken || null,
    });

    await newWholesaler.save();

    res.send({ message: 'Wholesaler submitted successfully', wholesaler: newWholesaler });
  } catch (err) {
    console.error('createWholesaler error:', err);
    res.status(500).send({ message: err.message });
  }
};

// Delete Cloudinary asset by public id
const deleteCloudinaryAsset = async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return res.status(400).send({ message: 'publicId is required' });
    }

    // Validate Cloudinary credentials exist
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary credentials missing');
      return res.status(500).send({ message: 'Cloudinary credentials are not configured on the server. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.' });
    }

    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Attempt deletion. Some files (like PDFs) are stored as resource_type 'raw', so try default and fallback to 'raw'.
    const tryDestroy = (id, options = {}) =>
      new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(id, options, function (error, result) {
          if (error) return reject(error);
          return resolve(result);
        });
      });

    try {
      const result = await tryDestroy(publicId);
      // cloudinary returns { result: 'not found' } when missing
      if (result && result.result && result.result !== 'ok' && result.result !== 'deleted') {
        // try raw
        const rawResult = await tryDestroy(publicId, { resource_type: 'raw' });
        return res.send({ message: 'Deleted successfully', result: rawResult });
      }

      return res.send({ message: 'Deleted successfully', result });
    } catch (err) {
      console.warn('First destroy attempt failed, trying raw resource_type:', err?.message || err);
      try {
        const rawResult = await tryDestroy(publicId, { resource_type: 'raw' });
        return res.send({ message: 'Deleted successfully (raw)', result: rawResult });
      } catch (err2) {
        console.error('cloudinary destroy error:', err2);
        return res.status(500).send({ message: 'Failed to delete file from Cloudinary', detail: err2?.message || err2 });
      }
    }
  } catch (err) {
    console.error('deleteCloudinaryAsset error:', err);
    res.status(500).send({ message: err.message });
  }
};

// Simple server-side upload endpoint that accepts a data URL (base64) and uploads to Cloudinary
const cloudinaryUpload = async (req, res) => {
  try {
    const { file, publicId, folder = 'wholesaler' } = req.body;
    if (!file) return res.status(400).send({ message: 'file (data URL) is required' });

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary credentials missing for upload');
      return res.status(503).send({ message: 'Cloudinary credentials are not configured on the server. Uploads unavailable.' });
    }

    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const options = { folder, resource_type: 'auto' };
    if (publicId) options.public_id = publicId;
    // request delete token since this is a signed upload
    options.return_delete_token = true;

    const result = await cloudinary.uploader.upload(file, options);
    return res.send({ url: result.secure_url, publicId: result.public_id, deleteToken: result.delete_token || null, raw: result });
  } catch (err) {
    console.error('cloudinaryUpload error:', err);
    res.status(500).send({ message: err.message });
  }
};

// Create signature for signed uploads so client can request delete_token and perform client-side deletion
const cloudinarySign = async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('Cloudinary credentials missing for signing');
      return res.send({ signingAvailable: false, message: 'Cloudinary not configured on server.' });
    }

    const crypto = require('crypto');
    const { publicId, folder } = req.body || {};
    const timestamp = Math.floor(Date.now() / 1000);

    // Include return_delete_token to request delete token in response
    const params = { timestamp };
    if (publicId) params.public_id = publicId;
    if (folder) params.folder = folder;
    params.return_delete_token = true;
    console.log('cloudinarySign params:',);
    // Build string to sign (sorted by keys)
    const toSign = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('&');

    const signature = crypto
      .createHash('sha1')
      .update(toSign + process.env.CLOUDINARY_API_SECRET)
      .digest('hex');

    return res.send({ signature, timestamp, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME });
  } catch (err) {
    console.error('cloudinarySign error:', err);
    res.status(500).send({ message: err.message });
  }
};

const cloudinaryStatus = async (req, res) => {
  try {
    const signingAvailable = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
    return res.send({ signingAvailable, cloudName: process.env.CLOUDINARY_CLOUD_NAME || null });
  } catch (err) {
    console.error('cloudinaryStatus error:', err);
    res.status(500).send({ message: err.message });
  }
};

const addAllCustomers = async (req, res) => {
  try {
    await Customer.deleteMany();
    await Customer.insertMany(req.body);
    res.send({
      message: "Added all users successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const loginCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ email: req.body.email });

    if (!customer) {
      return res.status(404).send({
        message: "Account with this email does not exist. Please register first.",
        error: "USER_NOT_FOUND",
      });
    }

    if (
      customer.password &&
      bcrypt.compareSync(req.body.password, customer.password)
    ) {








      // If the account is a wholesaler, check approval status
      if (customer.role === 'wholesaler') {
        if (customer.wholesalerStatus === 'pending') {
          return res.status(403).send({
            message: 'Your account is currently under verification. You will be notified once approved by our team.',
            wholesalerStatus: 'pending',
          });
        }
        if (customer.wholesalerStatus === 'rejected') {
          return res.status(403).send({
            message: 'Your wholesaler application has been rejected. Please contact support for more information.',
            wholesalerStatus: 'rejected',
          });
        }
      }
      // Update lastLogin timestamp
      customer.lastLogin = new Date();
      await customer.save();

      // Fetch fresh customer data with populated cart to ensure we have latest details
      const customerWithCart = await Customer.findById(customer._id).populate({
        path: "cart.productId",
        select: "title prices image slug",
      });

      const token = signInToken(customerWithCart);
      res.send({
        token,
        _id: customerWithCart._id,
        name: customerWithCart.name,
        email: customerWithCart.email,
        address: customerWithCart.address,
        phone: customerWithCart.phone,
        image: customerWithCart.image,
        role: customerWithCart.role || "customer", // Added role
        cart: customerWithCart.cart,
      });
    } else {
      res.status(401).send({
        message: "Invalid user or password!",
        error: "Invalid user or password!",
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
      error: "Invalid user or password!",
    });
  }
};

const forgetPassword = async (req, res) => {
  const isAdded = await Customer.findOne({ email: req.body.email });
  if (!isAdded) {
    return res.status(404).send({
      message: "User Not found with this email!",
    });
  } else {
    const token = tokenForVerify(isAdded);
    const globalSetting = await Setting.findOne({ name: "globalSetting" });

    const option = {
      name: isAdded.name,
      email: req.body.email,
      contact_email: globalSetting?.setting?.email || "support@Farmacykart.com",
      token: token,
      shop_name: globalSetting?.setting?.shop_name || "Farmacykart",
    };

    const body = {
      from: globalSetting?.setting?.email || process.env.EMAIL_USER,
      to: `${req.body.email}`,
      subject: "Password Reset",
      html: forgetPasswordEmailBody(option),
    };

    const message = "Please check your email to reset password!";
    try {
      await sendEmail(body);
      res.send({ message });
    } catch (emailErr) {
      console.error("Email send failed (non-blocking):", emailErr.message || emailErr);
      res.status(200).send({ message, emailError: emailErr.message || String(emailErr) });
    }
  }
};

const resetPassword = async (req, res) => {
  const token = req.body.token;
  const { email } = jwt.decode(token);
  const customer = await Customer.findOne({ email: email });

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_FOR_VERIFY || "fallback_jwt_verify_secret", (err, decoded) => {
      if (err) {
        return res.status(500).send({
          message: "Token expired, please try again!",
        });
      } else {
        customer.password = bcrypt.hashSync(req.body.newPassword);
        customer.save();
        res.send({
          message: "Your password change successful, you can login now!",
        });
      }
    });
  }
};

// Send credentials email to wholesaler (admin action)
const sendCredentials = async (req, res) => {
  try {
    const id = req.params.id;
    const { password } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) return res.status(404).send({ message: 'Wholesaler not found' });

    // Require client to provide plaintext password (do not generate on server)
    if (!password || String(password).trim().length === 0) {
      return res.status(400).send({ message: 'Password is required. Generate it from the admin UI and send it.' });
    }
    const plainPassword = String(password);
    // Prepare transporter and send mail directly so we can update DB only on success
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || process.env.STORE_URL || 'http://localhost:3000';
    const mailBody = {
      from: process.env.EMAIL_USER || 'no-reply@farmcykart.com',
      to: customer.email,
      subject: 'Your Wholesaler Login Credentials',
      html: `<p>Hi ${customer.name || 'Wholesaler'},</p>
             <p>Your wholesaler panel login credentials are below:</p>
             <p><strong>Email:</strong> ${customer.email}</p>
             <p><strong>Password:</strong> ${plainPassword}</p>
             <p>Login here: <a href="${frontendUrl}">${frontendUrl}</a></p>
             <p>Regards,<br/>Farmacykart Team</p>`,
    };

    transporter.verify(async (verErr) => {
      if (verErr) {
        console.error('Email transporter verify error:', verErr);
        return res.status(403).send({ message: `Email service verification failed: ${verErr.message}` });
      }

      transporter.sendMail(mailBody, async (err, info) => {
        if (err) {
          console.error('sendCredentials email send error:', err);
          return res.status(403).send({ message: `Error sending email: ${err.message}` });
        }

        // On success update customer's password (hashed) and counters
        customer.password = bcrypt.hashSync(plainPassword);
        customer.credentialEmailCount = (customer.credentialEmailCount || 0) + 1;
        customer.lastCredentialEmailSentAt = new Date();
        await customer.save();

        return res.send({ message: 'Credentials emailed successfully', credentialEmailCount: customer.credentialEmailCount, lastCredentialEmailSentAt: customer.lastCredentialEmailSentAt });
      });
    });
  } catch (err) {
    console.error('sendCredentials error:', err);
    res.status(500).send({ message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    // console.log("changePassword", req.body);
    const customer = await Customer.findOne({ email: req.body.email });
    if (!customer.password) {
      return res.status(403).send({
        message:
          "For change password,You need to sign up with email & password!",
      });
    } else if (
      customer &&
      bcrypt.compareSync(req.body.currentPassword, customer.password)
    ) {
      customer.password = bcrypt.hashSync(req.body.newPassword);
      await customer.save();
      res.send({
        message: "Your password change successfully!",
      });
    } else {
      res.status(401).send({
        message: "Invalid email or current password!",
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const signUpWithProvider = async (req, res) => {
  try {
    // const { user } = jwt.decode(req.body.params);
    const user = jwt.decode(req.params.token);

    // console.log("user", user);
    const isAdded = await Customer.findOne({ email: user.email });
    if (isAdded) {
      const token = signInToken(isAdded);
      res.send({
        token,
        _id: isAdded._id,
        name: isAdded.name,
        email: isAdded.email,
        address: isAdded.address,
        phone: isAdded.phone,
        image: isAdded.image,
        role: isAdded.role || "customer",
      });
    } else {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 15 * 60 * 1000);
      const newUser = new Customer({
        name: user.name,
        email: user.email,
        image: user.picture,
        emailVerified: false, emailVerificationOtp: otp, emailVerificationExpires: otpExpires, // OAuth emails are pre-verified
      });

      const signUpCustomer = await newUser.save();
      const token = signInToken(signUpCustomer);
      res.send({
        token,
        _id: signUpCustomer._id,
        name: signUpCustomer.name,
        email: signUpCustomer.email,
        image: signUpCustomer.image,
        role: signUpCustomer.role || "customer",
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const signUpWithOauthProvider = async (req, res) => {
  try {
    // console.log("user", user);
    // console.log("signUpWithOauthProvider", req.body);
    const isAdded = await Customer.findOne({ email: req.body.email });
    if (isAdded) {
      const token = signInToken(isAdded);
      res.send({
        token,
        _id: isAdded._id,
        name: isAdded.name,
        email: isAdded.email,
        address: isAdded.address,
        phone: isAdded.phone,
        image: isAdded.image,
        role: isAdded.role || "customer",
      });
    } else {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 15 * 60 * 1000);
      const newUser = new Customer({
        name: req.body.name,
        email: req.body.email,
        image: req.body.image,
        emailVerified: false, emailVerificationOtp: otp, emailVerificationExpires: otpExpires,
      });

      const signUpCustomer = await newUser.save();
      const token = signInToken(signUpCustomer);
      res.send({
        token,
        _id: signUpCustomer._id,
        name: signUpCustomer.name,
        email: signUpCustomer.email,
        image: signUpCustomer.image,
        role: signUpCustomer.role || "customer",
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const { searchText = "", filterType = "" } = req.query;
    let query = {};

    // Calculate 30 days ago date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // This month's date range
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // Apply filter based on filterType
    if (filterType) {
      switch (filterType) {
        case "newSignUpsToday":
          query.createdAt = {
            $gte: today,
            $lt: tomorrow,
          };
          break;

        case "newSignUpsThisMonth":
          query.createdAt = {
            $gte: startOfMonth,
            $lte: endOfMonth,
          };
          break;

        case "activeByLogin":
          query.$and = [
            {
              lastLogin: {
                $gte: thirtyDaysAgo,
              },
            },
          ];
          break;

        case "activeByOrder":
          // Get customer IDs who placed orders in last 30 days
          const recentOrderUsers = await Order.distinct("user", {
            createdAt: {
              $gte: thirtyDaysAgo,
            },
            user: { $ne: null },
          });
          query._id = { $in: recentOrderUsers };
          break;

        case "inactiveByNoLogin":
          query.$and = [
            {
              $or: [
                { blocked: { $exists: false } },
                { blocked: false },
                { blocked: null },
              ],
            },
            {
              $or: [
                { lastLogin: null },
                { lastLogin: { $lt: thirtyDaysAgo } },
                { lastLogin: { $exists: false } },
              ],
            },
          ];
          break;

        case "inactiveByNoOrder":
          // Get customer IDs who placed orders in last 30 days
          const orderUsers = await Order.distinct("user", {
            createdAt: {
              $gte: thirtyDaysAgo,
            },
            user: { $ne: null },
          });
          query.$and = [
            {
              $or: [
                { blocked: { $exists: false } },
                { blocked: false },
                { blocked: null },
              ],
            },
            {
              _id: { $nin: orderUsers },
            },
          ];
          break;

        default:
          // No additional filter for "all"
          break;
      }
    }

    // Apply search text filter if provided
    if (searchText) {
      query.$or = [
        { name: { $regex: searchText, $options: "i" } },
        { email: { $regex: searchText, $options: "i" } },
        { phone: { $regex: searchText, $options: "i" } },
      ];
    }

    const users = await Customer.find(query).sort({ createdAt: -1 });
    res.send(users);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Get only wholesalers
const getAllWholesalers = async (req, res) => {
  try {
    const { searchText = "", wholesalerStatus = "" } = req.query;
    let query = { role: "wholesaler" };

    if (wholesalerStatus) {
      query.wholesalerStatus = wholesalerStatus;
    }

    if (searchText) {
      query.$or = [
        { name: { $regex: searchText, $options: "i" } },
        { email: { $regex: searchText, $options: "i" } },
        { phone: { $regex: searchText, $options: "i" } },
      ];
    }

    const wholesalers = await Customer.find(query).sort({ createdAt: -1 });
    res.send(wholesalers);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    // Populate cart.productId with prices and wholesaler metadata so admin/frontend can determine effective price
    const customer = await Customer.findById(req.params.id).populate({
      path: "cart.productId",
      select: "title prices image slug wholePrice minQuantity",
    });
    // console.log("getCustomerById cart:", JSON.stringify(customer?.cart, null, 2));
    res.send(customer);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// Shipping address create or update - supports multiple addresses
const addShippingAddress = async (req, res) => {
  try {
    const customerId = req.params.id;
    const newShippingAddress = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).send({ message: "Customer not found." });
    }

    // Ensure shippingAddress is an array (handle migration from Object to Array)
    if (!Array.isArray(customer.shippingAddress)) {
      // If it's an object, convert to array
      if (customer.shippingAddress && typeof customer.shippingAddress === 'object' && Object.keys(customer.shippingAddress).length > 0) {
        customer.shippingAddress = [customer.shippingAddress];
      } else {
        customer.shippingAddress = [];
      }
    }

    // If this is set as default, unset all other defaults
    if (newShippingAddress.isDefault) {
      customer.shippingAddress.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Add new address to array
    customer.shippingAddress.push(newShippingAddress);
    await customer.save();

    return res.send({
      message: "Shipping address added successfully.",
      success: true,
      shippingAddress: customer.shippingAddress,
    });
  } catch (err) {
    console.error("addShippingAddress error:", err);
    res.status(500).send({
      message: err.message || "Failed to add shipping address",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

const getShippingAddress = async (req, res) => {
  try {
    const customerId = req.params.id;
    const addressId = req.query.id;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).send({ message: "Customer not found." });
    }

    // Normalize shippingAddress to array
    let addresses = [];
    if (Array.isArray(customer.shippingAddress)) {
      addresses = customer.shippingAddress;
    } else if (customer.shippingAddress && typeof customer.shippingAddress === 'object' && Object.keys(customer.shippingAddress).length > 0) {
      // Convert old object format to array
      addresses = [customer.shippingAddress];
    }

    // If specific address ID requested
    if (addressId) {
      const address = addresses.find(
        (addr) => addr._id && addr._id.toString() === addressId.toString()
      );

      if (!address) {
        return res.status(404).send({
          message: "Shipping address not found!",
        });
      }

      return res.send({ shippingAddress: address });
    }

    // Return all addresses
    res.send({
      shippingAddress: addresses,
      success: true
    });
  } catch (err) {
    console.error("getShippingAddress error:", err);
    res.status(500).send({
      message: err.message || "Failed to get shipping address",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

const updateShippingAddress = async (req, res) => {
  try {
    const { userId, shippingId } = req.params;
    const updatedAddress = req.body;

    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).send({ message: "Customer not found." });
    }

    // Ensure shippingAddress is an array
    if (!Array.isArray(customer.shippingAddress)) {
      if (customer.shippingAddress && typeof customer.shippingAddress === 'object' && Object.keys(customer.shippingAddress).length > 0) {
        customer.shippingAddress = [customer.shippingAddress];
      } else {
        customer.shippingAddress = [];
      }
    }

    // Find the address index
    const addressIndex = customer.shippingAddress.findIndex(
      (addr) => addr._id && addr._id.toString() === shippingId.toString()
    );

    if (addressIndex === -1) {
      return res.status(404).send({ message: "Shipping address not found." });
    }

    // If this is set as default, unset all other defaults
    if (updatedAddress.isDefault) {
      customer.shippingAddress.forEach((addr, index) => {
        if (index !== addressIndex) {
          addr.isDefault = false;
        }
      });
    }

    // Update the address
    customer.shippingAddress[addressIndex] = {
      ...customer.shippingAddress[addressIndex].toObject(),
      ...updatedAddress,
    };

    await customer.save();

    res.send({
      message: "Shipping address updated successfully.",
      success: true,
      shippingAddress: customer.shippingAddress
    });
  } catch (err) {
    console.error("updateShippingAddress error:", err);
    res.status(500).send({
      message: err.message || "Failed to update shipping address",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

const deleteShippingAddress = async (req, res) => {
  try {
    const { userId, shippingId } = req.params;

    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).send({ message: "Customer not found." });
    }

    // Ensure shippingAddress is an array
    if (!Array.isArray(customer.shippingAddress)) {
      if (customer.shippingAddress && typeof customer.shippingAddress === 'object' && Object.keys(customer.shippingAddress).length > 0) {
        customer.shippingAddress = [customer.shippingAddress];
      } else {
        customer.shippingAddress = [];
      }
    }

    // Remove the address
    customer.shippingAddress = customer.shippingAddress.filter(
      (addr) => addr._id && addr._id.toString() !== shippingId.toString()
    );

    await customer.save();

    res.send({
      message: "Shipping Address Deleted Successfully!",
      success: true
    });
  } catch (err) {
    console.error("deleteShippingAddress error:", err);
    res.status(500).send({
      message: err.message || "Failed to delete shipping address",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

const updateCustomer = async (req, res) => {
  try {
    // Validate the input
    const { name, email, address, phone, image, cart } = req.body;

    // Find the customer by ID
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).send({
        message: "Customer not found!",
      });
    }

    // Check if the email already exists and does not belong to the current customer
    if (email) {
      const existingCustomer = await Customer.findOne({ email });
      if (
        existingCustomer &&
        existingCustomer._id.toString() !== customer._id.toString()
      ) {
        return res.status(400).send({
          message: "Email already exists.",
        });
      }
    }

    // Update customer details
    if (name) customer.name = name;
    if (email) customer.email = email;
    if (address) customer.address = address;
    if (phone) customer.phone = phone;
    if (image) customer.image = image;
    if (cart) customer.cart = cart;
    console.log("req.body", req.body);
    // Allow updating document fields and delete tokens
    if (req.body.aadhar !== undefined) customer.aadhar = req.body.aadhar;
    if (req.body.aadharPublicId !== undefined) customer.aadharPublicId = req.body.aadharPublicId;
    if (req.body.aadharDeleteToken !== undefined) customer.aadharDeleteToken = req.body.aadharDeleteToken;

    if (req.body.pan !== undefined) customer.pan = req.body.pan;
    if (req.body.panPublicId !== undefined) customer.panPublicId = req.body.panPublicId;
    if (req.body.panDeleteToken !== undefined) customer.panDeleteToken = req.body.panDeleteToken;

    if (req.body.gst !== undefined) customer.gst = req.body.gst;
    if (req.body.gstPublicId !== undefined) customer.gstPublicId = req.body.gstPublicId;
    if (req.body.gstDeleteToken !== undefined) customer.gstDeleteToken = req.body.gstDeleteToken;

    if (req.body.drugLicense !== undefined) customer.drugLicense = req.body.drugLicense;
    if (req.body.drugLicensePublicId !== undefined) customer.drugLicensePublicId = req.body.drugLicensePublicId;
    if (req.body.drugLicenseDeleteToken !== undefined) customer.drugLicenseDeleteToken = req.body.drugLicenseDeleteToken;

    // Allow admin to set/update password for wholesaler
    if (req.body.password && typeof req.body.password === 'string' && req.body.password.trim().length > 0) {
      customer.password = bcrypt.hashSync(req.body.password);
    }

    // Allow admin to update wholesaler approval status
    if (req.body.wholesalerStatus !== undefined) {
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (validStatuses.includes(req.body.wholesalerStatus)) {
        customer.wholesalerStatus = req.body.wholesalerStatus;
      }
    }

    // Save the updated customer
    const updatedUser = await customer.save();

    // Generate a new token
    const token = signInToken(updatedUser);

    // Send the updated customer data with the new token
    res.send({
      token,
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      address: updatedUser.address,
      phone: updatedUser.phone,
      image: updatedUser.image,
      role: updatedUser.role || "customer",
      message: "Customer updated successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const deleteCustomer = (req, res) => {
  Customer.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      res.status(500).send({
        message: err.message,
      });
    } else {
      res.status(200).send({
        message: "User Deleted Successfully!",
      });
    }
  });
};

// Get customer statistics
const getCustomerStatistics = async (req, res) => {
  try {
    // Total customers
    const totalCustomers = await Customer.countDocuments();

    // Today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // This month's date range
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // Today signups
    const todaySignups = await Customer.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    // This month signups
    const thisMonthSignups = await Customer.countDocuments({
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    // Active customers - Last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Active customers based on login (lastLogin within last 30 days)
    const activeCustomersByLogin = await Customer.countDocuments({
      lastLogin: {
        $gte: thirtyDaysAgo,
      },
    });

    // Active customers based on orders (customers who placed order within last 30 days)
    // Get distinct customer IDs who placed orders in last 30 days
    const recentOrderUsers = await Order.distinct("user", {
      createdAt: {
        $gte: thirtyDaysAgo,
      },
      user: { $ne: null }, // Exclude null/undefined users
    });

    // Count unique customers who placed orders
    const activeCustomersByOrder = recentOrderUsers.length;

    // Inactive customers by no login: NOT blocked AND (no login OR login > 30 days ago)
    const inactiveCustomersByNoLogin = await Customer.countDocuments({
      $and: [
        {
          // NOT blocked
          $or: [
            { blocked: { $exists: false } },
            { blocked: false },
            { blocked: null },
          ],
        },
        {
          // No login OR login > 30 days ago
          $or: [
            { lastLogin: null },
            { lastLogin: { $lt: thirtyDaysAgo } },
            { lastLogin: { $exists: false } },
          ],
        },
      ],
    });

    // Inactive customers by no order: NOT blocked AND no order in last 30 days
    const inactiveCustomersByNoOrder = await Customer.countDocuments({
      $and: [
        {
          // NOT blocked
          $or: [
            { blocked: { $exists: false } },
            { blocked: false },
            { blocked: null },
          ],
        },
        {
          // No order in last 30 days (customer ID not in recentOrderUsers)
          _id: { $nin: recentOrderUsers },
        },
      ],
    });

    res.send({
      totalCustomers,
      todaySignups,
      thisMonthSignups,
      activeCustomersByLogin,
      activeCustomersByOrder,
      inactiveCustomersByNoLogin,
      inactiveCustomersByNoOrder,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// ─── CART MANAGEMENT ──────────────────────────────────────────────────────────

/**
 * GET /customer/cart/:customerId
 * Returns the customer's cart with populated product details.
 */
const getCart = async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await Customer.findById(customerId).populate({
      path: "cart.productId",
      select: "title prices image slug wholePrice minQuantity stock variants",
    });
    if (!customer) {
      return res.status(404).send({ message: "Customer not found." });
    }
    res.send({ cart: customer.cart });
  } catch (err) {
    console.error("getCart error:", err);
    res.status(500).send({ message: err.message });
  }
};

/**
 * POST /customer/cart/:customerId/add
 * Body: { productId, quantity }
 * Upserts a product into the customer's cart.
 */
const addToCart = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).send({ message: "productId is required." });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).send({ message: "Customer not found." });
    }

    const qty = Math.max(1, Number(quantity));
    const existingItem = customer.cart.find(
      (c) => c.productId && c.productId.toString() === productId.toString()
    );

    if (existingItem) {
      existingItem.quantity = existingItem.quantity + qty;
    } else {
      customer.cart.push({ productId, quantity: qty });
    }

    await customer.save();

    // Return populated cart
    const updated = await Customer.findById(customerId).populate({
      path: "cart.productId",
      select: "title prices image slug wholePrice minQuantity stock variants",
    });

    res.send({ message: "Cart updated successfully.", cart: updated.cart });
  } catch (err) {
    console.error("addToCart error:", err);
    res.status(500).send({ message: err.message });
  }
};

/**
 * PUT /customer/cart/:customerId/update
 * Body: { productId, quantity }
 * Sets the quantity for an existing cart item. Removes it if quantity <= 0.
 */
const updateCartItem = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).send({ message: "productId is required." });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).send({ message: "Customer not found." });
    }

    const qty = Number(quantity);

    if (qty <= 0) {
      // Remove item
      customer.cart = customer.cart.filter(
        (c) => c.productId && c.productId.toString() !== productId.toString()
      );
    } else {
      const item = customer.cart.find(
        (c) => c.productId && c.productId.toString() === productId.toString()
      );
      if (item) {
        item.quantity = qty;
      } else {
        customer.cart.push({ productId, quantity: qty });
      }
    }

    await customer.save();

    const updated = await Customer.findById(customerId).populate({
      path: "cart.productId",
      select: "title prices image slug wholePrice minQuantity stock variants",
    });

    res.send({ message: "Cart item updated.", cart: updated.cart });
  } catch (err) {
    console.error("updateCartItem error:", err);
    res.status(500).send({ message: err.message });
  }
};

/**
 * DELETE /customer/cart/:customerId/remove/:productId
 * Removes a specific product from the customer's cart.
 */
const removeFromCart = async (req, res) => {
  try {
    const { customerId, productId } = req.params;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).send({ message: "Customer not found." });
    }

    customer.cart = customer.cart.filter(
      (c) => c.productId && c.productId.toString() !== productId.toString()
    );

    await customer.save();
    res.send({ message: "Item removed from cart.", cart: customer.cart });
  } catch (err) {
    console.error("removeFromCart error:", err);
    res.status(500).send({ message: err.message });
  }
};

/**
 * DELETE /customer/cart/:customerId/clear
 * Clears all items from the customer's cart.
 */
const clearCart = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).send({ message: "Customer not found." });
    }

    customer.cart = [];
    await customer.save();
    res.send({ message: "Cart cleared.", cart: [] });
  } catch (err) {
    console.error("clearCart error:", err);
    res.status(500).send({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

const checkCustomerExistance = async (req, res) => {
  try {
    const { email, phone } = req.body;
    let query = {};
    if (email) query.email = email;
    if (phone) query.phone = phone;

    if (Object.keys(query).length === 0) {
      return res.status(400).send({ message: "Email or Phone is required" });
    }

    const customer = await Customer.findOne(query);
    if (customer) {
      return res.send({ exists: true, name: customer.name });
    } else {
      return res.send({ exists: false });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    await Customer.findByIdAndUpdate(req.params.id, { $set: { fcmToken } });
    res.status(200).send({
      message: "FCM Token updated successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

module.exports = {
  checkCustomerExistance,
  loginCustomer,
  // ... rest of exports
  loginWithPhone,
  verifyPhoneNumber,
  registerCustomer,
  registerCustomerDirect,
  addAllCustomers,
  signUpWithProvider,
  signUpWithOauthProvider,
  verifyEmailAddress,
  forgetPassword,
  changePassword,
  resetPassword,
  getAllCustomers,
  getAllWholesalers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  addShippingAddress,
  getShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
  getCustomerStatistics,
  createWholesaler,
  deleteCloudinaryAsset,
  cloudinarySign,
  cloudinaryStatus,
  cloudinaryUpload,
  sendCredentials,
  // Cart management
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  updateFcmToken,
  verifyEmailOTP,
  resendVerificationEmail,
  sendPhoneEmailOTP,
  verifyPhoneEmailOTP,
};
