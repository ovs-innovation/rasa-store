export const typeLabel = (type) => {
  const map = {
    offer: "Offer",
    order: "Order",
    general: "Update",
  };
  return map[type] || "Update";
};

export const typeBadgeClass = (type) => {
  const map = {
    offer: "bg-emerald-100 text-emerald-700",
    order: "bg-blue-100 text-blue-700",
    general: "bg-gray-100 text-gray-600",
  };
  return map[type] || map.general;
};

export const resolveLink = (clickAction) => {
  if (!clickAction || clickAction === "/") return "/";
  if (clickAction.startsWith("http")) return clickAction;
  return clickAction.startsWith("/") ? clickAction : `/${clickAction}`;
};

export const invalidateCustomerNotifications = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ["customerNotifications"] });
  queryClient.invalidateQueries({ queryKey: ["customerNotificationsAll"] });
  queryClient.invalidateQueries({ queryKey: ["customerNotificationDetail"] });
};
