import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import React, { useEffect, useState, useContext } from "react";

import Label from "@components/form/Label";
import Error from "@components/form/Error";
import Dashboard from "@pages/user/dashboard";
import InputArea from "@components/form/InputArea";
import EmailVerificationField from "@components/user/EmailVerificationField";
import { isPlaceholderEmail } from "@utils/profileAuth";
import useGetSetting from "@hooks/useGetSetting";
import CustomerServices from "@services/CustomerServices";
import Uploader from "@components/image-uploader/Uploader";
import { notifySuccess, notifyError } from "@utils/toast";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { UserContext } from "@context/UserContext";

const UpdateProfile = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session, update } = useSession();
  const { state: userState, dispatch } = useContext(UserContext);

  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  const userInfo = userState?.userInfo || session?.user;
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  const hasVerifiedRealEmail =
    userInfo?.email &&
    !isPlaceholderEmail(userInfo.email) &&
    userInfo.emailVerified;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const emailValue = watch("email");

  const onSubmit = async (data) => {
    if (!imageUrl && !userInfo?.image) {
      notifyError("Please upload a profile photo before saving.");
      return;
    }

    const emailTrimmed = (data.email || "").trim();
    if (
      emailTrimmed &&
      !hasVerifiedRealEmail &&
      (!emailVerified || emailTrimmed.toLowerCase() !== verifiedEmail.toLowerCase())
    ) {
      notifyError("Please verify your email with the code we sent, or leave email blank.");
      return;
    }

    setLoading(true);

    const userData = {
      name: data.name,
      email: hasVerifiedRealEmail
        ? userInfo.email
        : emailTrimmed || userInfo?.email,
      phone: data.phone,
      image: imageUrl || userInfo?.image || "",
    };

    try {
      const userId = userInfo?._id || userInfo?.id;
      if (!userId) {
        throw new Error("User ID not found. Please login again.");
      }

      const response = await CustomerServices.updateCustomer(userId, userData);

      const updatedUserInfo = {
        ...userInfo,
        name: data.name,
        email: response?.email || userData.email,
        phone: data.phone,
        image: userData.image,
        emailVerified: response?.emailVerified ?? userInfo?.emailVerified,
      };

      Cookies.set("userInfo", JSON.stringify(updatedUserInfo), { expires: 1 });
      dispatch({ type: "USER_LOGIN", payload: updatedUserInfo });

      if (session?.user) {
        update({
          ...session,
          user: {
            ...session.user,
            name: data.name,
            email: data.email,
            phone: data.phone,
            image: userData.image,
          },
        });
      }

      setLoading(false);
      notifySuccess("Profile Updated Successfully! 🎉");
    } catch (error) {
      setLoading(false);
      notifyError(error?.response?.data?.message || error?.message || "Failed to update profile. Please try again.");
    }
  };

  useEffect(() => {
    if (userInfo) {
      setValue("name", userInfo?.name);
      const existingEmail = isPlaceholderEmail(userInfo.email)
        ? ""
        : userInfo.email || "";
      setValue("email", existingEmail);
      setValue("phone", userInfo?.phone);
      setImageUrl(userInfo?.image || "");

      if (
        existingEmail &&
        userInfo.emailVerified &&
        !isPlaceholderEmail(userInfo.email)
      ) {
        setVerifiedEmail(existingEmail);
        setEmailVerified(true);
      }
    }
  }, [userInfo, setValue]);

  return (
    <Dashboard
      title={showingTranslateValue(
        storeCustomizationSetting?.dashboard?.update_profile
      )}
      description="This is edit profile page"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-50 transition-all hover:shadow-md">
          <div className="mb-8 border-b border-gray-50 pb-6">
            <h2 className="text-2xl font-serif font-bold text-gray-800">
              {showingTranslateValue(
                storeCustomizationSetting?.dashboard?.update_profile
              )}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Update your personal information and profile picture</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Photo Section */}
            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
              <Label label="Profile Photo" className="text-sm font-bold text-gray-700 mb-4 block" />
              <div className="flex flex-col items-center sm:flex-row gap-6">
                <div className="flex-1 w-full">
                  <Uploader imageUrl={imageUrl} setImageUrl={setImageUrl} />
                  {imageUrl && (
                    <div className="flex items-center justify-center gap-1.5 mt-3 text-store-600 font-semibold text-xs">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Image ready to save
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <InputArea
                  register={register}
                  label={showingTranslateValue(
                    storeCustomizationSetting?.dashboard?.full_name
                  )}
                  name="name"
                  type="text"
                  placeholder="Your Full Name"
                />
                <Error errorName={errors.name} />
              </div>

              <div className="space-y-1">
                <InputArea
                  register={register}
                  label={showingTranslateValue(
                    storeCustomizationSetting?.dashboard?.user_phone
                  )}
                  name="phone"
                  type="tel"
                  placeholder="Your Phone Number"
                />
                <Error errorName={errors.phone} />
              </div>

              <div className="md:col-span-2 space-y-1">
                {hasVerifiedRealEmail ? (
                  <>
                    <InputArea
                      register={register}
                      name="email"
                      type="email"
                      readOnly={true}
                      label={showingTranslateValue(
                        storeCustomizationSetting?.dashboard?.user_email
                      )}
                      placeholder="Your Email Address"
                      required={false}
                    />
                    <p className="text-[10px] text-green-600 mt-1">
                      Verified email on your account.
                    </p>
                  </>
                ) : (
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
                      const next = {
                        ...userInfo,
                        email,
                        emailVerified: true,
                      };
                      Cookies.set("userInfo", JSON.stringify(next), { expires: 1 });
                      dispatch({ type: "USER_LOGIN", payload: next });
                    }}
                  />
                )}
                <Error errorName={errors.email} />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-50 flex justify-end">
              <button
                disabled={loading}
                type="submit"
                className={`group flex items-center justify-center gap-2 px-8 py-3.5 bg-store-500 text-white font-bold rounded-xl hover:bg-store-600 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed min-w-[180px]`}
              >
                {loading ? (
                  <>
                    <img
                      src="/loader/spinner.gif"
                      alt="Loading"
                      width={20}
                      height={20}
                      className="brightness-0 invert"
                    />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {showingTranslateValue(
                      storeCustomizationSetting?.dashboard?.update_button
                    )}
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dashboard>
  );
};

export default UpdateProfile;
