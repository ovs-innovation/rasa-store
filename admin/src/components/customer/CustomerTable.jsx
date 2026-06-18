import { TableBody, TableCell, TableRow, Badge } from "@windmill/react-ui";
import dayjs from "dayjs";
import { t } from "i18next";
import React from "react";
import { FiZoomIn, FiMail, FiPhone, FiCalendar, FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";

//internal import
import MainDrawer from "@/components/drawer/MainDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import Tooltip from "@/components/tooltip/Tooltip";
import CustomerDrawer from "@/components/drawer/CustomerDrawer";
import EditDeleteButton from "@/components/table/EditDeleteButton";

const CustomerTable = ({ customers }) => {
  const { title, serviceId, handleModalOpen, handleUpdate } = useToggleDrawer();

  return (
    <>
      <DeleteModal id={serviceId} title={title} />

      <MainDrawer>
        <CustomerDrawer id={serviceId} />
      </MainDrawer>

      <TableBody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
        {customers?.map((user) => (
          <TableRow key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors group">
            <TableCell className="py-4 pl-6">
              <div className="flex flex-col">
                <span className="font-bold text-[11px] text-gray-400 uppercase tracking-tighter">
                  ID: {user?._id?.substring(18, 24)}
                </span>
              </div>
            </TableCell>
            
            <TableCell className="py-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <FiCalendar className="text-gray-400" size={14} />
                <span className="text-sm font-medium">
                  {dayjs(user.createdAt).format("MMM D, YYYY")}
                </span>
              </div>
            </TableCell>

            <TableCell className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm border border-teal-100 dark:border-teal-800/20 group-hover:scale-110 transition-transform">
                  <FiUser size={16} />
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.name}</span>
              </div>
            </TableCell>

            <TableCell className="py-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <FiMail className="text-gray-400" size={14} />
                <span className="text-sm">{user.email}</span>
              </div>
            </TableCell>

            <TableCell className="py-4">
              <Badge 
                type="success"
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              >
                {user.role || "Customer"}
              </Badge>
            </TableCell>

            <TableCell className="py-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                <FiPhone className="text-gray-400" size={12} />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{user.phone || 'N/A'}</span>
              </div>
            </TableCell>

            <TableCell className="py-4 pr-6">
              <div className="flex justify-end items-center gap-2">
                <Link 
                  to={`/customer-order/${user._id}`}
                  className="p-2.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all shadow-sm"
                >
                  <Tooltip
                    id="view"
                    Icon={FiZoomIn}
                    title={t("ViewOrder")}
                    bgColor="#0e7473"
                  />
                </Link>

                <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm overflow-hidden flex">
                   <EditDeleteButton
                    title={user.name}
                    id={user._id}
                    handleUpdate={handleUpdate}
                    handleModalOpen={handleModalOpen}
                  />
                </div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default CustomerTable;
