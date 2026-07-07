import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { t } from "i18next";
import React from "react";
import { FiShoppingBag, FiEdit, FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";

import MainDrawer from "@/components/drawer/MainDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import CustomerDrawer from "@/components/drawer/CustomerDrawer";

dayjs.extend(relativeTime);

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

const getStatus = (user) => {
  if (user?.blocked) {
    return { label: "Blocked", className: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300" };
  }
  if (user?.lastLogin) {
    const daysSinceLogin = dayjs().diff(dayjs(user.lastLogin), "day");
    if (daysSinceLogin <= 30) {
      return { label: "Active", className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300" };
    }
  }
  return { label: "Inactive", className: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" };
};

const CustomerTable = ({ customers }) => {
  const { title, serviceId, handleModalOpen, handleUpdate } = useToggleDrawer();

  return (
    <>
      <DeleteModal id={serviceId} title={title} />

      <MainDrawer>
        <CustomerDrawer id={serviceId} />
      </MainDrawer>

      <TableBody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
        {customers?.map((user) => {
          const status = getStatus(user);

          return (
            <TableRow
              key={user._id}
              className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
            >
              <TableCell className="py-4">
                <div className="flex items-center gap-3 min-w-[220px]">
                  <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {user.name || "Unnamed"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email || "—"}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="py-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {user.createdAt ? dayjs(user.createdAt).format("DD MMM YYYY") : "—"}
                </p>
                {user.createdAt && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {dayjs(user.createdAt).fromNow()}
                  </p>
                )}
              </TableCell>

              <TableCell className="py-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {user.phone || "—"}
                </p>
              </TableCell>

              <TableCell className="py-4">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${status.className}`}>
                  {status.label}
                </span>
              </TableCell>

              <TableCell className="py-4">
                <div className="flex justify-end items-center gap-1">
                  <Link
                    to={`/customer-order/${user._id}`}
                    title={t("ViewOrder")}
                    className="p-2 rounded-lg text-gray-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                  >
                    <FiShoppingBag size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleUpdate(user._id)}
                    title={t("Edit")}
                    className="p-2 rounded-lg text-gray-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                  >
                    <FiEdit size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModalOpen(user._id, user.name)}
                    title={t("Delete")}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </>
  );
};

export default CustomerTable;
