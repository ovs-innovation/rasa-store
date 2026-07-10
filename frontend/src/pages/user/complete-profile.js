import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Link from "next/link";

import Layout from "@layout/Layout";
import Label from "@components/form/Label";
import Error from "@components/form/Error";
import InputArea from "@components/form/InputArea";
import EmailVerificationField from "@components/user/EmailVerificationField";
import { useSession } from "next-auth/react";
import { readUserInfoFromCookie } from "@lib/auth";
import { UserContext } from "@context/UserContext";
import CustomerServices from "@services/CustomerServices";
import saveAuthSession from "@utils/saveAuthSession";
import { isProfileComplete, getDisplayEmail } from "@utils/profileAuth";
import { notifyError, notifySuccess } from "@utils/toast";

const CompleteProfile = () => {
  const router = useRouter();
  const { state, dispatch } = useContext(UserContext);
  const { data: sessionData } = useSession();
  const sessionUser = sessionData?.user?.token ? sessionData.user : null;
  const userInfo = state?.userInfo || sessionUser || readUserInfoFromCookie();
  const [loading, setLoading] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const emailValue = watch("email");
  const isCheckout = router.query.next === "checkout";

  useEffect(() => {
    if (
      emailValue &&
      verifiedEmail &&
      emailValue.trim().toLowerCase() !== verifiedEmail.toLowerCase()
    ) {
      setEmailVerified(false);
    }
  }, [emailValue, verifiedEmail]);

  useEffect(() => {
    if (!userInfo?.token) {
      router.replace(`/auth/login?redirectUrl=${router.query.next || ""}`);
      return;
    }
    if (isProfileComplete(userInfo)) {
      router.replace(isCheckout ? "/checkout" : "/");
    }
  }, [userInfo, router, isCheckout]);

  useEffect(() => {
    if (userInfo) {
      setValue("name", userInfo.name?.startsWith("User ") ? "" : userInfo.name || "");
      setValue("email", getDisplayEmail(userInfo));
      setValue("phone", userInfo.phone || "");
      setValue("address", userInfo.address || "");

      if (getDisplayEmail(userInfo) && userInfo.emailVerified) {
        setVerifiedEmail(getDisplayEmail(userInfo));
        setEmailVerified(true);
      }
    }
  }, [userInfo, setValue]);

  const onSubmit = async (data) => {
    const emailTrimmed = (data.email || "").trim();
    if (
      emailTrimmed &&
      (!emailVerified || emailTrimmed.toLowerCase() !== verifiedEmail.toLowerCase())
    ) {
      notifyError("Please verify your email with the code we sent, or leave email blank.");
      return;
    }

    setLoading(true);
    try {
      const response = await CustomerServices.completeProfile({
        name: data.name,
        email: emailTrimmed || undefined,
        phone: data.phone,
        address: data.address,
        city: data.city,
        zipCode: data.zipCode,
        country: data.country || "India",
      });

      saveAuthSession(response, dispatch);
      notifySuccess("Profile saved! You can place your order now.");
      router.push(isCheckout ? "/checkout" : "/");
    } catch (err) {
      notifyError(
        err?.response?.data?.message || err?.message || "Could not save profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Complete Profile">
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Complete your profile
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            {isCheckout
              ? "Add delivery details to place your order. Email is optional."
              : "Add your name and delivery address. Email is optional."}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <InputArea
              register={register}
              label="Full Name"
              name="name"
              type="text"
              placeholder="Your full name"
            />
            <Error errorName={errors.name} />
          </div>

          <EmailVerificationField
            register={register}
            errors={errors}
            emailValue={emailValue}
            verifiedEmail={verifiedEmail}
            isVerified={emailVerified}
            onVerified={({ email }) => {
              setVerifiedEmail(email);
              setEmailVerified(true);
              setValue("email", email);
            }}
          />

          <div>
            <InputArea
              register={register}
              label="Mobile Number"
              name="phone"
              type="tel"
              placeholder="10-digit mobile"
            />
            <Error errorName={errors.phone} />
          </div>

          <div>
            <Label label="Delivery address" />
            <textarea
              {...register("address", { required: "Address is required" })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-store-500 focus:border-store-500 outline-none"
              placeholder="House no., street, area, landmark"
            />
            <Error errorName={errors.address} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputArea
              register={register}
              label="City"
              name="city"
              type="text"
              placeholder="City"
              required={false}
            />
            <InputArea
              register={register}
              label="PIN Code"
              name="zipCode"
              type="text"
              placeholder="PIN"
              required={false}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-store-600 hover:bg-store-700 text-white font-bold disabled:opacity-60"
          >
            {loading
              ? "Saving..."
              : isCheckout
                ? "Save & Continue"
                : "Save Profile"}
          </button>

          {!isCheckout && (
            <p className="text-center text-sm text-gray-500 mt-4">
              <Link href="/" className="text-store-600 hover:underline">
                Skip for now — browse home
              </Link>
            </p>
          )}
        </form>
        </div>
      </div>
    </Layout>
  );
};

export default CompleteProfile;
