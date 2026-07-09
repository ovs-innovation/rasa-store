import Cookies from "js-cookie";

export const setAdminInfoCookie = (adminInfo, expires = 0.5) => {
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  Cookies.set("adminInfo", JSON.stringify(adminInfo), {
    expires,
    sameSite: isLocalhost ? "Lax" : "None",
    secure: !isLocalhost,
  });
};

export const clearAdminInfoCookie = () => {
  Cookies.remove("adminInfo");
};
