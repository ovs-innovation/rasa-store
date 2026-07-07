import Cookies from "js-cookie";
import { useSession } from "next-auth/react";
import React, { createContext, useEffect, useReducer, useState } from "react";

import { setToken } from "@services/httpServices";
import LoadingForSession from "@components/preloader/LoadingForSession";

export const UserContext = createContext();

const emptyState = {
  userInfo: null,
  shippingAddress: {},
  couponInfo: {},
};

const readCookieState = () => {
  if (typeof window === "undefined") return emptyState;

  try {
    const userInfoCookie = Cookies.get("userInfo");
    const shippingAddressCookie = Cookies.get("shippingAddress");
    const couponInfoCookie = Cookies.get("couponInfo");

    return {
      userInfo: userInfoCookie ? JSON.parse(userInfoCookie) : null,
      shippingAddress: shippingAddressCookie ? JSON.parse(shippingAddressCookie) : {},
      couponInfo: couponInfoCookie ? JSON.parse(couponInfoCookie) : {},
    };
  } catch {
    return emptyState;
  }
};

function reducer(state, action) {
  switch (action.type) {
    case "USER_LOGIN":
      return { ...state, userInfo: action.payload };

    case "USER_LOGOUT":
      return {
        ...state,
        userInfo: null,
      };

    case "SAVE_SHIPPING_ADDRESS":
      return { ...state, shippingAddress: action.payload };

    case "SAVE_COUPON":
      return { ...state, couponInfo: action.payload };

    default:
      return state;
  }
}

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, emptyState);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
    const cookieState = readCookieState();
    if (cookieState.userInfo?.token) {
      setToken(cookieState.userInfo.token);
      dispatch({ type: "USER_LOGIN", payload: cookieState.userInfo });
    }
    if (cookieState.shippingAddress && Object.keys(cookieState.shippingAddress).length > 0) {
      dispatch({ type: "SAVE_SHIPPING_ADDRESS", payload: cookieState.shippingAddress });
    }
    if (cookieState.couponInfo && Object.keys(cookieState.couponInfo).length > 0) {
      dispatch({ type: "SAVE_COUPON", payload: cookieState.couponInfo });
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const cookieUserInfo = Cookies.get("userInfo");

    if (cookieUserInfo) {
      const parsedUser = JSON.parse(cookieUserInfo);
      if (parsedUser?.token) {
        setToken(parsedUser.token);
        dispatch({ type: "USER_LOGIN", payload: parsedUser });
        return;
      }
    }

    if (status === "authenticated" && session?.user) {
      setToken(session.user.token);
      const user = {
        ...session.user,
        _id: session.user._id || session.user.id,
      };
      Cookies.set("userInfo", JSON.stringify(user), { expires: 1 });
      dispatch({ type: "USER_LOGIN", payload: user });
    } else if (status === "unauthenticated" && !cookieUserInfo) {
      setToken(null);
      Cookies.remove("userInfo");
      dispatch({ type: "USER_LOGOUT" });
    }
  }, [session, status, mounted]);

  useEffect(() => {
    const handleStorageChange = () => {
      const cookieUserInfo = Cookies.get("userInfo");
      if (cookieUserInfo) {
        const parsedUser = JSON.parse(cookieUserInfo);
        if (parsedUser?.token) {
          setToken(parsedUser.token);
          dispatch({ type: "USER_LOGIN", payload: parsedUser });
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (mounted && status === "loading" && !state.userInfo) {
    return <LoadingForSession />;
  }

  const value = { state, dispatch };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
