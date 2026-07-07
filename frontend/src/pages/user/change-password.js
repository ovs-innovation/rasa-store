import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

//internal import
import { getUserSession } from "@lib/auth";
import Error from "@components/form/Error";
import UserDashboardLayout from "@components/user/UserDashboardLayout";
import InputArea from "@components/form/InputArea";
import useGetSetting from "@hooks/useGetSetting";
import CustomerServices from "@services/CustomerServices";
import { notifyError, notifySuccess } from "@utils/toast";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { UD } from "@components/user/userDashboardTheme";
import withNoSsr from "@utils/withNoSsr";

const ChangePassword = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);

  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const userInfo = getUserSession();

  const onSubmit = async ({ email, currentPassword, newPassword }) => {
    // return notifySuccess("This Feature is disabled for demo!");

    setLoading(true);
    try {
      const res = await CustomerServices.changePassword({
        email,
        currentPassword,
        newPassword,
      });
      notifySuccess(res.message);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      notifyError(error ? error.response.data.message : error.message);
    }
  };

  useEffect(() => {
    setValue("email", userInfo?.email);
  }, []);

  return (
    <UserDashboardLayout
      title={showingTranslateValue(
        storeCustomizationSetting?.dashboard?.change_password
      )}
      description="This is change-password page"
    >
      <div className="max-w-md space-y-5">
        <div>
          <h1 className={UD.pageTitle}>
            {showingTranslateValue(storeCustomizationSetting?.dashboard?.change_password) || "Change Password"}
          </h1>
          <p className={UD.pageSubtitle}>Update your account password</p>
        </div>

        <div className={UD.panelPad}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <InputArea
                register={register}
                label={showingTranslateValue(storeCustomizationSetting?.dashboard?.user_email)}
                name="email"
                type="email"
                autocomplete="username"
                placeholder="Email"
                readOnly
              />
              <Error errorName={errors.email} />
            </div>
            <div>
              <InputArea
                register={register}
                label={showingTranslateValue(storeCustomizationSetting?.dashboard?.current_password)}
                name="currentPassword"
                type="password"
                autocomplete="current-password"
                placeholder="Current password"
              />
              <Error errorName={errors.currentPassword} />
            </div>
            <div>
              <InputArea
                register={register}
                label={showingTranslateValue(storeCustomizationSetting?.dashboard?.new_password)}
                name="newPassword"
                type="password"
                autocomplete="new-password"
                placeholder="New password (min 8 chars)"
                pattern={/.{8,}/}
                patternMessage="Password must be at least 8 characters."
              />
              <Error errorName={errors.newPassword} />
            </div>
            <div className="pt-4 border-t border-neutral-800 flex justify-end">
              <button disabled={loading} type="submit" className={UD.btnPrimary}>
                {loading ? "Updating..." : showingTranslateValue(storeCustomizationSetting?.dashboard?.change_password) || "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </UserDashboardLayout>
  );
};

export default withNoSsr(ChangePassword);
