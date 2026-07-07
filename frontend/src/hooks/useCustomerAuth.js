import { useContext, useEffect, useMemo } from "react";
import { UserContext } from "@context/UserContext";
import { setToken } from "@services/httpServices";

/** Resolves logged-in customer from context or cookie and ensures API token is set. */
export default function useCustomerAuth() {
  const { state } = useContext(UserContext);

  const userInfo = useMemo(() => {
    if (state?.userInfo?.token) return state.userInfo;
    return null;
  }, [state?.userInfo]);

  useEffect(() => {
    if (userInfo?.token) {
      setToken(userInfo.token);
    }
  }, [userInfo?.token]);

  const userId = userInfo?._id || userInfo?.id;
  const isLoggedIn = !!(userInfo?.token && userId);

  return { userInfo, userId, isLoggedIn };
}
