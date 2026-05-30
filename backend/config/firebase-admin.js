const admin = require("firebase-admin");

if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/^["']|["']$/g, "").replace(/\\n/g, "\n")
      : undefined;

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log("Firebase Admin initialized successfully.");
    } else {
      console.warn("Firebase Admin credentials missing. ID token verification will fail.");
    }
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

module.exports = admin;
