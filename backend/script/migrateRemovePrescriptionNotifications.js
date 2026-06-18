/**
 * Removes prescriptionId from notifications (Prescription model deleted).
 * Usage: node backend/script/migrateRemovePrescriptionNotifications.js
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Notification = require("../models/Notification");

const run = async () => {
  await connectDB();

  const withRx = await Notification.countDocuments({ prescriptionId: { $exists: true } });
  console.log(`Notifications with prescriptionId: ${withRx}`);

  const result = await Notification.updateMany({}, { $unset: { prescriptionId: "" } });
  console.log(`Updated ${result.nModified ?? result.modifiedCount} notification documents.`);

  await mongoose.connection.close();
  console.log("Done.");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
