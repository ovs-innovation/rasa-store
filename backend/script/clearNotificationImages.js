/**
 * Removes image field from admin notifications (legacy placeholder logos).
 * Usage: node backend/script/clearNotificationImages.js
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Notification = require("../models/Notification");

const run = async () => {
  await connectDB();

  const withImage = await Notification.countDocuments({
    image: { $exists: true, $nin: [null, ""] },
  });
  console.log(`Notifications with image: ${withImage}`);

  const result = await Notification.updateMany({}, { $unset: { image: "" } });
  console.log(
    `Cleared image from ${result.nModified ?? result.modifiedCount} notification documents.`
  );

  await mongoose.connection.close();
  console.log("Done.");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
