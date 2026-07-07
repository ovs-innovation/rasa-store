import React from "react";
import { FiUsers, FiUserPlus, FiActivity, FiUserX } from "react-icons/fi";

const StatCard = ({ title, value, sub, icon: Icon, color, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-left w-full rounded-2xl border p-5 transition-all ${
      active
        ? "border-[#D4AF37]/50 bg-[#D4AF37]/5 shadow-sm"
        : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      {active && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
          Active filter
        </span>
      )}
    </div>
    <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white leading-none">
      {value ?? 0}
    </p>
    <p className="mt-1 text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</p>
    {sub && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</p>}
  </button>
);

const CustomerOverview = ({ statistics, loading, filterType, onFilterChange }) => {
  const cards = [
    {
      key: "all",
      title: "Total Customers",
      sub: "All registered users",
      value: loading ? "—" : statistics?.totalCustomers,
      icon: FiUsers,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
    },
    {
      key: "newSignUpsThisMonth",
      title: "New This Month",
      sub: `${statistics?.todaySignups ?? 0} joined today`,
      value: loading ? "—" : statistics?.thisMonthSignups,
      icon: FiUserPlus,
      color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
    },
    {
      key: "activeByLogin",
      title: "Active",
      sub: "Logged in last 30 days",
      value: loading ? "—" : statistics?.activeCustomersByLogin,
      icon: FiActivity,
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
    {
      key: "inactiveByNoLogin",
      title: "Inactive",
      sub: "No login in 30 days",
      value: loading ? "—" : statistics?.inactiveCustomersByNoLogin,
      icon: FiUserX,
      color: "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <StatCard
          key={card.key}
          {...card}
          active={filterType === card.key || (card.key === "all" && filterType === "all")}
          onClick={() => onFilterChange(card.key)}
        />
      ))}
    </div>
  );
};

export default CustomerOverview;
