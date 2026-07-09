import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory, useLocation } from "react-router-dom";

//internal import
import { AdminContext } from "@/context/AdminContext";
import AdminServices from "@/services/AdminServices";
import { setAdminInfoCookie } from "@/utils/adminCookie";
import { notifyError, notifySuccess } from "@/utils/toast";

const useLoginSubmit = () => {
  const [loading, setLoading] = useState(false);
  const { dispatch } = useContext(AdminContext);
  const history = useHistory();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "admin@rasastore.com",
      password: "RasaStore@123",
    },
  });

  const onSubmit = async ({ name, email, verifyEmail, password, role }) => {
    setLoading(true);
    const cookieTimeOut = 0.5;
    const normalizedEmail = String(email || "").trim();
    const normalizedPassword = String(password || "").trim();

    try {
      if (location.pathname === "/login") {
        const res = await AdminServices.loginAdmin({
          email: normalizedEmail,
          password: normalizedPassword,
        });

        if (res) {
          notifySuccess("Login Success!");
          dispatch({ type: "USER_LOGIN", payload: res });
          setAdminInfoCookie(res, cookieTimeOut);
          history.replace("/dashboard");
        }
      }

      if (location.pathname === "/signup") {
        const res = await AdminServices.registerAdmin({
          name,
          email,
          password,
          role,
        });

        if (res) {
          notifySuccess("Register Success!");
          dispatch({ type: "USER_LOGIN", payload: res });
          setAdminInfoCookie(res, cookieTimeOut);
          history.replace("/");
        }
      }

      if (location.pathname === "/forgot-password") {
        const res = await AdminServices.forgetPassword({ verifyEmail });

        notifySuccess(res.message);
      }
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    onSubmit,
    register,
    handleSubmit,
    errors,
    loading,
  };
};

export default useLoginSubmit;
