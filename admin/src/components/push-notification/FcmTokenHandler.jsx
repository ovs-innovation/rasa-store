import { useContext, useEffect, useRef } from "react";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import app from "@/lib/firebase";
import AdminServices from "@/services/AdminServices";
import { AdminContext } from "@/context/AdminContext";
import { notifySuccess } from "@/utils/toast";

const FcmTokenHandler = () => {
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;
  const lastMessageId = useRef(null);

  useEffect(() => {
    const setupFcm = async () => {
      try {
        if (!adminInfo?._id) return;
        if (typeof window === "undefined" || !app) {
          console.warn(
            "Firebase not configured in admin. Add VITE_APP_FIREBASE_* keys to admin/.env"
          );
          return;
        }

        const supported = await isSupported();
        if (!supported) {
          console.log("FCM is not supported in this browser");
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notification permission denied");
          return;
        }

        const swRegistration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

        const messaging = getMessaging(app);
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_APP_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: swRegistration,
        });

        if (token && adminInfo?._id) {
          await AdminServices.updateFcmToken(adminInfo._id, token);
          console.log("Admin FCM token saved");
        }

        onMessage(messaging, (payload) => {
          if (payload.messageId && lastMessageId.current === payload.messageId) {
            return;
          }
          lastMessageId.current = payload.messageId;

          const title =
            payload.notification?.title || payload.data?.title || "New Notification";
          const body =
            payload.notification?.body ||
            payload.data?.body ||
            payload.data?.description ||
            "";

          notifySuccess(`${title}: ${body}`);
        });
      } catch (error) {
        console.error("Error setting up FCM in Admin:", error);
      }
    };

    setupFcm();
  }, [adminInfo?._id]);

  return null;
};

export default FcmTokenHandler;
