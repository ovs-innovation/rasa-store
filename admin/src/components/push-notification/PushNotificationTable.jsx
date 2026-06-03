import {
  TableBody,
  TableCell,
  TableRow,
  Avatar,
  Badge,
} from "@windmill/react-ui";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import { Link } from "react-router-dom";

//internal import
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import ShowHideButton from "@/components/table/ShowHideButton";
import PushNotificationServices from "@/services/PushNotificationServices";
import { resolveCloudinaryUrl } from "@/utils/cloudinaryUrl";

const PushNotificationTable = ({ 
    notifications, 
    isCheck, 
    setIsCheck,
    handleUpdate 
}) => {
  const { title, serviceId, handleModalOpen, handleUpdate: handleEdit } = useToggleDrawer();

  const handleClick = (e) => {
    const { id, checked } = e.target;
    setIsCheck([...isCheck, id]);
    if (!checked) {
      setIsCheck(isCheck.filter((item) => item !== id));
    }
  };

  return (
    <>
      <DeleteModal id={serviceId} title={title} service={PushNotificationServices} />

      <TableBody>
        {notifications?.map((notification, i) => (
          <TableRow key={i + 1}>
            <TableCell>
              <CheckBox
                type="checkbox"
                name={notification._id}
                id={notification._id}
                handleClick={handleClick}
                isChecked={isCheck.includes(notification._id)}
              />
            </TableCell>

            <TableCell>
              <span className="text-sm">{i + 1}</span>
            </TableCell>

            <TableCell>
              <div className="flex items-center">
                {resolveCloudinaryUrl(notification.image) ? (
                  <Avatar
                    className="mr-3 bg-gray-50 p-1"
                    src={resolveCloudinaryUrl(notification.image)}
                    alt="image"
                  />
                ) : notification.image ? (
                  <div className="bg-orange-100 text-orange-600 px-2 py-1 rounded-md text-[10px] font-semibold mr-2">
                    Old cloud
                  </div>
                ) : (
                  <div className="bg-orange-100 text-orange-500 px-2 py-1 rounded-md text-xs font-semibold">
                      No Image
                  </div>
                )}
              </div>
            </TableCell>

            <TableCell>
              <span className="text-sm">{notification.title}</span>
            </TableCell>

            <TableCell>
              <span className="text-sm truncate block max-w-xs">
                {notification.description}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-sm">{notification.target}</span>
            </TableCell>

            <TableCell>
              <span className="text-sm font-semibold text-teal-700">
                {notification.pushSentCount ?? 0}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm font-semibold text-blue-700">
                {notification.smsSentCount ?? 0}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm font-semibold text-purple-700">
                {notification.emailSentCount ?? 0}
              </span>
            </TableCell>

            <TableCell>
              <ShowHideButton 
                id={notification._id} 
                status={notification.status} 
                service={PushNotificationServices}
              />
            </TableCell>

            <TableCell>
              <div className="flex justify-end text-right">
                <button
                  onClick={() => handleUpdate(notification._id)}
                  className="p-2 cursor-pointer text-gray-400 hover:text-teal-600"
                >
                  <FiEdit />
                </button>
                <button
                  onClick={() => handleModalOpen(notification._id, notification.title)}
                  className="p-2 cursor-pointer text-gray-400 hover:text-red-600"
                >
                  <FiTrash2 />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default PushNotificationTable;
