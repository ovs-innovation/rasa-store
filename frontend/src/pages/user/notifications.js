import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiBell } from "react-icons/fi";

import UserDashboardLayout from "@components/user/UserDashboardLayout";
import useCustomerAuth from "@hooks/useCustomerAuth";
import CustomerNotificationServices from "@services/CustomerNotificationServices";
import NotificationListItem from "@components/notification/NotificationListItem";
import {
  invalidateCustomerNotifications,
  resolveLink,
} from "@utils/notificationHelpers";
import { notifyError, notifySuccess } from "@utils/toast";
import { UD } from "@components/user/userDashboardTheme";
import withNoSsr from "@utils/withNoSsr";

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
    <UserDashboardLayout title="Notifications" description="Your notifications">
      <div className="max-w-2xl space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className={UD.pageTitle}>Notifications</h1>
            <p className={UD.pageSubtitle}>Offers and updates from the store</p>
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
          <div className={`${UD.panelPad} text-center ${UD.muted}`}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div className={`${UD.panelPad} ${UD.empty}`}>
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
          <ul className={`${UD.panel} overflow-hidden divide-y divide-neutral-800`}>
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
    </UserDashboardLayout>
  );
};

export default withNoSsr(NotificationsPage);
