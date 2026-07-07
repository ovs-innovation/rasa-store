import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import React, { useEffect, useState, useContext } from "react";

import Label from "@components/form/Label";
import Error from "@components/form/Error";
import UserDashboardLayout from "@components/user/UserDashboardLayout";
import InputArea from "@components/form/InputArea";
import EmailVerificationField from "@components/user/EmailVerificationField";
import { isPlaceholderEmail } from "@utils/profileAuth";
import useGetSetting from "@hooks/useGetSetting";
import CustomerServices from "@services/CustomerServices";
import Uploader from "@components/image-uploader/Uploader";
import { notifySuccess, notifyError } from "@utils/toast";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { UserContext } from "@context/UserContext";
import { UD } from "@components/user/userDashboardTheme";
import withNoSsr from "@utils/withNoSsr";

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
    <UserDashboardLayout
      title={showingTranslateValue(
        storeCustomizationSetting?.dashboard?.update_profile
      )}
      description="This is edit profile page"
    >
      <div className="max-w-2xl">
        <div className="mb-5">
          <h1 className={UD.pageTitle}>
            {showingTranslateValue(storeCustomizationSetting?.dashboard?.update_profile) || "Edit Profile"}
          </h1>
          <p className={UD.pageSubtitle}>Update your name, phone, and photo</p>
        </div>

        <div className={UD.panelPad}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label label="Profile Photo" className={UD.label} />
              <Uploader imageUrl={imageUrl} setImageUrl={setImageUrl} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <InputArea
                  register={register}
                  label={showingTranslateValue(storeCustomizationSetting?.dashboard?.full_name)}
                  name="name"
                  type="text"
                  placeholder="Full Name"
                />
                <Error errorName={errors.name} />
              </div>
              <div>
                <InputArea
                  register={register}
                  label={showingTranslateValue(storeCustomizationSetting?.dashboard?.user_phone)}
                  name="phone"
                  type="tel"
                  placeholder="Phone"
                />
                <Error errorName={errors.phone} />
              </div>
              <div className="sm:col-span-2">
                {hasVerifiedRealEmail ? (
                  <>
                    <InputArea
                      register={register}
                      name="email"
                      type="email"
                      readOnly
                      label={showingTranslateValue(storeCustomizationSetting?.dashboard?.user_email)}
                      placeholder="Email"
                      required={false}
                    />
                    <p className="text-xs text-emerald-400 mt-1">Verified email</p>
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
                      const next = { ...userInfo, email, emailVerified: true };
                      Cookies.set("userInfo", JSON.stringify(next), { expires: 1 });
                      dispatch({ type: "USER_LOGIN", payload: next });
                    }}
                  />
                )}
                <Error errorName={errors.email} />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex justify-end">
              <button disabled={loading} type="submit" className={UD.btnPrimary}>
                {loading ? "Saving..." : showingTranslateValue(storeCustomizationSetting?.dashboard?.update_button) || "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </UserDashboardLayout>
  );
};

export default withNoSsr(UpdateProfile);
