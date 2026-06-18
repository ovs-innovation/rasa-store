import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiBell } from "react-icons/fi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import useCustomerAuth from "@hooks/useCustomerAuth";
import CustomerNotificationServices from "@services/CustomerNotificationServices";
import NotificationListItem from "@components/notification/NotificationListItem";
import {
  invalidateCustomerNotifications,
  resolveLink,
} from "@utils/notificationHelpers";
import { notifyError, notifySuccess } from "@utils/toast";

dayjs.extend(relativeTime);

const CustomerNotificationBell = () => {
  const { isLoggedIn, userId } = useCustomerAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const panelRef = useRef(null);

  const { data, refetch, isError, isLoading } = useQuery({
    queryKey: ["customerNotifications", userId],
    queryFn: () => CustomerNotificationServices.getMyNotifications({ limit: 8 }),
    enabled: isLoggedIn,
    refetchInterval: isLoggedIn ? 30000 : false,
    retry: 2,
  });

  const unreadCount = data?.unreadCount || 0;
  const notifications = data?.notifications || [];

  useEffect(() => {
    const onRefresh = () => {
      queryClient.invalidateQueries({ queryKey: ["customerNotifications"] });
    };
    window.addEventListener("customerNotificationsUpdated", onRefresh);
    return () =>
      window.removeEventListener("customerNotificationsUpdated", onRefresh);
  }, [queryClient]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!isLoggedIn) {
    return (
      <Link
        href="/auth/login"
        className="relative p-2.5 text-neutral-300 hover:text-white rounded-none hover:bg-neutral-900/50 transition-colors"
        aria-label="Login to see notifications"
        title="Login for notifications"
      >
        <FiBell className="text-xl" />
      </Link>
    );
  }

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open) refetch();
  };

  const handleItemClick = async (item) => {
    if (item.status === "unread") {
      try {
        await CustomerNotificationServices.markAsRead(item._id);
        invalidateCustomerNotifications(queryClient);
      } catch (err) {
        console.warn("markAsRead failed", err);
      }
    }
    setOpen(false);
    const href = resolveLink(item.clickAction);
    if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      router.push(href);
    }
  };

  const handleImageClick = (item) => {
    setOpen(false);
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

  const handleMarkAllRead = async () => {
    try {
      await CustomerNotificationServices.markAllAsRead();
      invalidateCustomerNotifications(queryClient);
    } catch (err) {
      console.warn("markAllAsRead failed", err);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative p-2.5 text-neutral-300 hover:text-white rounded-none hover:bg-neutral-900/50 transition-colors"
        aria-label="Notifications"
      >
        <FiBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center px-0.5 ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[min(92vw,380px)] rounded-2xl border border-gray-200/80 bg-white shadow-2xl z-[80] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-store-600 to-store-500 text-white">
            <p className="text-sm font-bold tracking-wide">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-white/90 hover:text-white underline-offset-2 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[min(70vh,320px)] overflow-y-auto">
            {isLoading ? (
              <p className="text-sm text-gray-500 text-center py-12">Loading...</p>
            ) : isError ? (
              <p className="text-sm text-red-600 text-center py-12 px-4">
                Could not load notifications. Please login again.
              </p>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 px-4">
                <FiBell className="mx-auto text-3xl text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">
                  No notifications yet. Offers and updates appear here.
                </p>
              </div>
            ) : (
              <ul>
                {notifications.map((item) => (
                  <li key={item._id}>
                    <NotificationListItem
                      item={item}
                      compact
                      onBodyClick={handleItemClick}
                      onImageClick={handleImageClick}
                      onDelete={handleDelete}
                      deleting={deletingId === item._id}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {(data?.totalDoc > notifications.length || notifications.length > 0) && (
            <div className="border-t border-gray-100 px-4 py-3 text-center bg-gray-50">
              <Link
                href="/user/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-bold text-store-600 hover:text-store-700 hover:underline"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerNotificationBell;
