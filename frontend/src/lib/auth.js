import Cookies from "js-cookie";
import { useSession } from "next-auth/react";

const readUserInfoFromCookie = () => {
  if (typeof window === "undefined") return null;

  try {
    const raw = Cookies.get("userInfo");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token ? parsed : null;
  } catch {
    return null;
  }
};

const getUserSession = () => {
  const { data } = useSession();
  if (data?.user?.token) return data.user;
  return readUserInfoFromCookie();
};

export { getUserSession, readUserInfoFromCookie };
