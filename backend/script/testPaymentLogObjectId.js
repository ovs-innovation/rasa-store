/**
 * Reproduce + verify PaymentLog ObjectId hardening.
 * Usage: node script/testPaymentLogObjectId.js
 */
require("../config/env");
const mongoose = require("mongoose");
const {
  writePaymentLog,
  toObjectIdString,
} = require("../modules/payment/service/paymentLogger");
const PaymentLog = require("../models/PaymentLog");

(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const fakeId = new mongoose.Types.ObjectId();
  const fakeDoc = {
    _id: fakeId,
    status: "Success",
    amount: 1299,
    order: new mongoose.Types.ObjectId(),
  };

  console.log("toObjectIdString(doc)", toObjectIdString(fakeDoc));
  console.log("toObjectIdString(plain)", toObjectIdString({ a: 1 }));
  console.log("toObjectIdString(id)", toObjectIdString(fakeId));

  // These used to cast-fail when payment got a plain object / document
  await writePaymentLog({
    payment: fakeDoc, // full object — must NOT throw / cast-fail
    order: fakeDoc.order,
    merchantOrderId: "RASA-TEST-LOG",
    correlationId: "cid_test_log",
    source: "System",
    action: "objectid_hardening_test_doc",
    success: true,
    message: "passed document as payment",
    response: {
      orderId: fakeDoc.order, // ObjectId inside Mixed — must sanitize
      nested: fakeDoc,
    },
  });

  await writePaymentLog({
    payment: { totally: "wrong" }, // invalid — omitted, must not fail payment
    merchantOrderId: "RASA-TEST-LOG",
    correlationId: "cid_test_log",
    source: "System",
    action: "objectid_hardening_test_bad",
    success: true,
    message: "passed bad payment object",
  });

  await writePaymentLog({
    payment: String(fakeId),
    merchantOrderId: "RASA-TEST-LOG",
    correlationId: "cid_test_log",
    source: "Verify",
    action: "objectid_hardening_test_ok",
    success: true,
    message: "passed string id",
  });

  const logs = await PaymentLog.find({ merchantOrderId: "RASA-TEST-LOG" })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  console.log(
    "logs written:",
    logs.map((l) => ({
      action: l.action,
      payment: l.payment ? String(l.payment) : null,
      hasResponseOrder: Boolean(l.response?._orderId || l.response?.orderId),
    }))
  );

  await PaymentLog.deleteMany({ merchantOrderId: "RASA-TEST-LOG" });
  console.log("cleanup ok");
  await mongoose.disconnect();
  console.log("PASS");
})().catch((e) => {
  console.error("FAIL", e);
  process.exit(1);
});
