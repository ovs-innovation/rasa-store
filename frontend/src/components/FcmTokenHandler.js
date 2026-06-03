import { useEffect, useRef, useContext } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import app from '@lib/firebase';
import CustomerServices from '@services/CustomerServices';
import { UserContext } from '@context/UserContext';
import { toast } from 'react-toastify';
import { FiBell, FiExternalLink, FiX } from 'react-icons/fi';

const FcmTokenHandler = () => {
  const lastMessageId = useRef(null);
  const { state } = useContext(UserContext);
  const { userInfo } = state;

  useEffect(() => {
    const setupFcm = async () => {
      try {
        if (!userInfo?._id) return;
        if (typeof window === 'undefined' || !app) {
          console.warn(
            'Firebase not configured. Add NEXT_PUBLIC_FIREBASE_* keys to frontend/.env'
          );
          return;
        }

        if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) {
          console.warn(
            'FCM VAPID key missing. Add NEXT_PUBLIC_FIREBASE_VAPID_KEY to frontend/.env'
          );
          return;
        }

        const supported = await isSupported();
        if (!supported) {
          console.log("FCM is not supported in this browser");
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('Notification permission denied');
          return;
        }

        const swRegistration = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js'
        );

        const messaging = getMessaging(app);
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: swRegistration,
        });

        if (token && userInfo?._id) {
          console.log("FCM Token Generated:", token.substring(0, 10) + "...");
          await CustomerServices.updateFcmToken(userInfo._id, token);
        }

        // 4. Handle foreground messages
        onMessage(messaging, (payload) => {
          console.log("FOREGROUND FCM MESSAGE RECEIVED", payload);
          
          // Prevent duplicate notifications
          if (payload.messageId && lastMessageId.current === payload.messageId) {
            console.log("Duplicate message ignored:", payload.messageId);
            return;
          }
          lastMessageId.current = payload.messageId;

          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("customerNotificationsUpdated"));
          }

          // Extract data
          const title = payload.notification?.title || payload.data?.title || "New Notification";
          const body = payload.notification?.body || payload.data?.body || payload.data?.description || "";
          const imageUrl = payload.notification?.image || payload.data?.image || payload.notification?.imageUrl;
          const clickAction = payload.data?.click_action || payload.data?.url || '/';

          // Show Top-Right Toast
          toast.info(
            <div className="flex items-start gap-3 p-1">
              {imageUrl ? (
                <div className="flex-shrink-0 w-12 h-12 relative rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                  <img 
                    src={imageUrl} 
                    alt="notification" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FiBell className="text-emerald-600 text-lg" />
                </div>
              )}
              <div className="flex-grow min-w-0">
                <h4 className="text-sm font-bold text-gray-800 truncate mb-0.5">{title}</h4>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{body}</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  View Details <FiExternalLink />
                </div>
              </div>
            </div>,
            {
              icon: false,
              closeButton: ({ closeToast }) => (
                <button onClick={closeToast} className="p-1 hover:bg-gray-100 rounded transition-all">
                  <FiX className="text-gray-400" />
                </button>
              ),
              onClick: () => {
                if (clickAction) {
                  window.open(clickAction, '_blank');
                }
              },
              className: "rounded-xl shadow-xl border border-gray-50",
              bodyClassName: "p-0",
              position: "top-right",
              autoClose: 6000,
            }
          );
        });

      } catch (error) {
        console.error('Error setting up FCM in component:', error);
      }
    };

    setupFcm();
  }, [userInfo?._id]);

  return null;
};

export default FcmTokenHandler;
