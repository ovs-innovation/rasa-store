import { AdminContext } from "@/context/AdminContext";
import { useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";

const useGetCData = () => {
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;

  const location = useLocation();
  // const path = location?.pathname?.split("/")[1];
  const path = location?.pathname?.split("?")[0].split("/")[1];
  //   console.log("location", location?.pathname?.split("/")[1]);

  const [role, setRole] = useState();
  const [accessList, setAccessList] = useState([]);

  // Function to decrypt data
  const decryptData = async (encryptedData, iv) => {
    const secretKey = import.meta.env.VITE_APP_ENCRYPT_PASSWORD;
    if (!secretKey || !encryptedData || !iv) return null;

    try {
      const keyBuffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(secretKey)
      );

      const encryptedArray = new Uint8Array(
        encryptedData.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
      );

      const ivBuffer = new Uint8Array(
        iv.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
      );

      const decrypted = await crypto.subtle.decrypt(
        {
          name: "AES-CBC",
          iv: ivBuffer,
        },
        await crypto.subtle.importKey(
          "raw",
          keyBuffer,
          { name: "AES-CBC" },
          false,
          ["decrypt"]
        ),
        encryptedArray
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.warn("Admin access decrypt skipped:", error?.name || error);
      return null;
    }
  };

  useEffect(() => {
    const fetchDecryptedData = async () => {
      if (!adminInfo) return;

      if (adminInfo?.data && adminInfo?.iv) {
        try {
          const decryptedString = await decryptData(
            adminInfo.data,
            adminInfo.iv
          );

          if (decryptedString) {
            const decryptedArray = JSON.parse(decryptedString);
            if (Array.isArray(decryptedArray) && decryptedArray.length > 0) {
              const lastElement = decryptedArray[decryptedArray.length - 1];
              setRole(lastElement);
              setAccessList(decryptedArray.slice(0, -1));
              return;
            }
          }
        } catch (error) {
          console.warn("Failed to decrypt admin access list:", error);
        }
      }

      if (adminInfo?.role) {
        setRole(adminInfo.role);
        setAccessList(
          Array.isArray(adminInfo.access_list) ? adminInfo.access_list : []
        );
      }
    };

    fetchDecryptedData();
  }, [adminInfo]);
  // console.log("adminInfo", adminInfo, "accessList", accessList);

  return {
    role,
    path,
    accessList,
  };
};

export default useGetCData;
