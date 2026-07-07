import React from "react";
import { Link } from "react-router-dom";
import {
  FiRefreshCw,
  FiBox,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

const DetailedOrderStatus = ({ dashboardOrderCount }) => {
  const cards = [
    {
      title: "Pending",
      value: dashboardOrderCount?.totalPendingOrder?.count || 0,
      valueColor: "text-yellow-600",
      iconBg: "bg-yellow-50 dark:bg-yellow-900/30",
      iconColor: "text-yellow-500",
      Icon: FiRefreshCw,
    },
    {
      title: "Processing",
      value: dashboardOrderCount?.totalProcessingOrder || 0,
      valueColor: "text-orange-600",
      iconBg: "bg-orange-50 dark:bg-orange-900/30",
      iconColor: "text-orange-500",
      Icon: FiBox,
    },
    {
      title: "Delivered",
      value: dashboardOrderCount?.totalDeliveredOrder || 0,
      valueColor: "text-emerald-600",
      iconBg: "bg-green-50 dark:bg-green-900/30",
      iconColor: "text-green-500",
      Icon: FiCheckCircle,
    },
    {
      title: "Cancelled",
      value: dashboardOrderCount?.totalCancelOrder || 0,
      valueColor: "text-red-600",
      iconBg: "bg-red-50 dark:bg-red-900/30",
      iconColor: "text-red-500",
      Icon: FiXCircle,
    },
  ];

  return (
    <div className="w-full dark:bg-[#0f0f0f] bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/[0.06]">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <Link
            key={index}
            to="/orders"
            className="flex items-center justify-between p-4 bg-[#f8fafb] dark:bg-white/[0.03] rounded-2xl border border-gray-100 dark:border-white/[0.06] hover:shadow-md hover:border-[#D4AF37]/30 transition-all group no-underline"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}
              >
                <card.Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-[#D4AF37] transition-colors">
                {card.title}
              </span>
            </div>
            <span className={`text-xl font-bold ${card.valueColor}`}>
              {card.value}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DetailedOrderStatus;
