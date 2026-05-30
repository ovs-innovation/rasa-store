import { useRouter } from "next/router";
import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Cookies from "js-cookie";
import { UserContext } from "@context/UserContext";

//internal import

import { notifyError, notifySuccess } from "@utils/toast";
import CustomerServices from "@services/CustomerServices";
import { auth } from "@lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";

const useLoginSubmit = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [wholesalerStatus, setWholesalerStatus] = useState(null); // 'pending' | 'rejected' | null
  const redirectUrl = useSearchParams().get("redirectUrl");
  const { dispatch } = useContext(UserContext);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // console.log("router", router.pathname === "/auth/signup");

  const submitHandler = async ({ name, email, password, phone }) => {
    setLoading(true);

    // console.log("submitHandler", phone);

    try {
      if (router.pathname === "/auth/signup") {
        // Firebase Signup
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        await sendEmailVerification(firebaseUser);
        
        const idToken = await firebaseUser.getIdToken();

        const res = await CustomerServices.registerUser({
          idToken,
          name,
          phone
        });

        if (res.requiresVerification) {
          notifySuccess(res.message);
          reset();
          router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
        } else {
          notifySuccess(res.message || "Signup successful!");
          reset();
          router.push("/auth/login");
        }
        return setLoading(false);
      } else if (router.pathname === "/auth/forget-password") {
        // Use Firebase to send the password reset email
        await sendPasswordResetEmail(auth, email);
        
        notifySuccess("Password reset email sent! Please check your inbox.");
        reset();
        router.push("/auth/login");
        return setLoading(false);
      } else if (router.pathname === "/auth/phone-signup") {
        const res = await CustomerServices.verifyPhoneNumber({
          phone,
        });
        notifySuccess(res.message);
        // console.log("sing up with phone", phone, "result", res);
        return setLoading(false);
      } else {
        // Login via Firebase and backend
        try {
          // Firebase Login
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const idToken = await userCredential.user.getIdToken();

          const res = await CustomerServices.loginCustomer({ idToken });

          if (res && res.token) {
            // setToken(res.token); // Assuming setToken is imported if needed
            const userInfo = {
              _id: res._id,
              name: res.name,
              email: res.email,
              phone: res.phone,
              address: res.address || "",
              image: res.image || "",
              token: res.token,
              role: res.role || "customer",
            };

            Cookies.set("userInfo", JSON.stringify(userInfo), { expires: 1 });

            if (dispatch) {
              dispatch({ type: "USER_LOGIN", payload: userInfo });
            }

            const url = redirectUrl ? "/checkout" : "/user/dashboard";
            reset();
            router.push(url);
            setLoading(false);
          } else {
            throw new Error("Invalid login response");
          }
        } catch (err) {
          console.error("Login error:", err);
          const respData = err?.response?.data;
          
          if (err?.response?.status === 404 || respData?.error === "USER_NOT_FOUND") {
            const msg = respData?.message || "Account not found. Please register first.";
            notifyError(msg);
            setLoading(false);
            setTimeout(() => {
              router.push("/auth/signup");
            }, 1500);
            return;
          }

          if (respData?.requiresVerification) {
            notifyError(respData.message || "Please verify your email.");
            router.push(`/auth/verify-email?email=${encodeURIComponent(respData.email || email)}`);
          } else if (respData?.wholesalerStatus) {
            setWholesalerStatus(respData.wholesalerStatus);
            notifyError(respData.message || "Account not yet approved.");
          } else {
            setWholesalerStatus(null);
            notifyError(respData?.message || err.message || "Login failed");
          }
          setLoading(false);
        }
      }
    } catch (error) {
      // Catch any unexpected errors here (e.g., network issues, unexpected API failures)
      console.error(
        "Error in submitHandler:",
        error?.response?.data?.message || error?.message
      );
      setLoading(false);
      notifyError(error?.response?.data?.message || error?.message);
    }
  };

  return {
    register,
    errors,
    loading,
    control,
    handleSubmit,
    submitHandler,
    reset,
    setValue,
    wholesalerStatus,
  };
};

export default useLoginSubmit;
