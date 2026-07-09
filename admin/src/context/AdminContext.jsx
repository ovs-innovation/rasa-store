import Cookies from "js-cookie";
import React, { createContext, useReducer } from 'react';
import { resolveCloudinaryUrl } from '@/utils/cloudinaryUrl';
import { setAdminInfoCookie } from '@/utils/adminCookie';

export const AdminContext = createContext();

const sanitizeAdminInfo = (info) => {
  if (!info) return null;
  if (info.image && !resolveCloudinaryUrl(info.image)) {
    const next = { ...info, image: '' };
    setAdminInfoCookie(next);
    return next;
  }
  return info;
};

const initialState = {
  adminInfo: Cookies.get('adminInfo')
    ? sanitizeAdminInfo(JSON.parse(Cookies.get('adminInfo')))
    : null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'USER_LOGIN':
      return { ...state, adminInfo: action.payload };

    case 'USER_LOGOUT':
      return {
        ...state,
        adminInfo: null,
      };

    default:
      return state;
  }
}

export const AdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};
