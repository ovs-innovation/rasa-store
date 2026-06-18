import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiBell } from "react-icons/fi";

import Dashboard from "@pages/user/dashboard";
import useCustomerAuth from "@hooks/useCustomerAuth";
import CustomerNotificationServices from "@services/CustomerNotificationServices";
import NotificationListItem from "@components/notification/NotificationListItem";
import {
  invalidateCustomerNotifications,
  resolveLink,
} from "@utils/notificationHelpers";
import { notifyError, notifySuccess } from "@utils/toast";

const NotificationsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoggedIn, userId } = useCustomerAuth();
  const [deletingId, setDeletingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["customerNotificationsAll", userId],
    queryFn: () =>
      CustomerNotificationServices.getMyNotifications({ limit: 50, page: 1 }),
    enabled: isLoggedIn,
  });

  useEffect(() => {
    if (!isLoggedIn) router.replace("/auth/login");
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleClick = async (item) => {
    if (item.status === "unread") {
      await CustomerNotificationServices.markAsRead(item._id);
      invalidateCustomerNotifications(queryClient);
    }
    const href = resolveLink(item.clickAction);
    if (href.startsWith("http")) window.open(href, "_blank", "noopener,noreferrer");
    else router.push(href);
  };

  const handleImageClick = (item) => {
    router.push(`/user/notifications/${item._id}`);
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Delete this notification?")) return;
    setDeletingId(item._id);
    try {
      await CustomerNotificationServices.deleteNotification(item._id);
      invalidateCustomerNotifications(queryClient);
      notifySuccess("Notification deleted");
    } catch (err) {
      notifyError(err?.message || "Could not delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkAll = async () => {
    await CustomerNotificationServices.markAllAsRead();
    invalidateCustomerNotifications(queryClient);
    notifySuccess("All marked as read");
  };

  return (
    <Dashboard title="Notifications" description="Your notifications">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-white">
              Notifications
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Tap an image to view it full size. Offers and updates from
              Rasa Store.
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="shrink-0 text-sm font-bold text-[#D4AF37] hover:text-white px-3 py-1.5 rounded-lg hover:bg-neutral-900 transition-all duration-200"
            >
              Mark all read
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-neutral-900 bg-[#0A0A0A] p-12 text-center text-neutral-400 text-sm">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-900 bg-neutral-950/20 text-center py-20 px-6">
            <span className="inline-flex w-16 h-16 rounded-2xl bg-neutral-900 text-[#D4AF37] items-center justify-center mb-4 border border-neutral-800">
              <FiBell className="text-3xl" />
            </span>
            <p className="font-bold text-white">No notifications yet</p>
            <p className="text-sm text-neutral-400 mt-2 max-w-sm mx-auto">
              When admin sends offers or updates, they will show up here and in
              the bell icon.
            </p>
          </div>
        ) : (
          <ul className="rounded-2xl border border-neutral-900 bg-[#0A0A0A] shadow-lg overflow-hidden divide-y divide-neutral-900">
            {notifications.map((item) => (
              <li key={item._id}>
                <NotificationListItem
                  item={item}
                  showRelativeTime={false}
                  onBodyClick={handleClick}
                  onImageClick={handleImageClick}
                  onDelete={handleDelete}
                  deleting={deletingId === item._id}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Dashboard>
  );
};

export default NotificationsPage;
