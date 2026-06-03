import { Button, Input } from "@windmill/react-ui";
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

//internal import
import Error from "@/components/form/others/Error";
import LabelArea from "@/components/form/selectOption/LabelArea";
import AdminServices from "@/services/AdminServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import { ADMIN_BRAND_LOGO } from "@/utils/cloudinaryUrl";

const ResetPassword = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const password = useRef("");
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  password.current = watch("newPassword");

  const submitHandler = ({ newPassword }) => {
    setLoading(true);

    AdminServices.resetPassword({ newPassword, token })
      .then((res) => {
        setLoading(false);
        notifySuccess(res.message);
      })
      .catch((err) => {
        setLoading(false);
        notifyError(err ? err.response.data.message : err.message);
      });
  };

  return (
    <div className="flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 h-full max-w-2xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <div className="flex flex-col overflow-y-auto">
          <div className="w-full flex justify-center p-6">
            <img
              aria-hidden="true"
              className="object-contain h-20 w-20"
              src={ADMIN_BRAND_LOGO}
              alt="Farmacykart"
            />
          </div>
          <main className="flex items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-sm">
              <h1 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200 text-center">
                {t("ResetPassword")}
              </h1>

              <form onSubmit={handleSubmit(submitHandler)}>
                <LabelArea label="Password" />
                <Input
                  label="Password"
                  name="newPassword"
                  type="password"
                  autocomplete="current-password"
                  placeholder="Password"
                  {...register("newPassword", {
                    required: "You must specify a password",
                    minLength: {
                      value: 10,
                      message: "Password must have at least 10 characters",
                    },
                  })}
                />
                <Error errorName={errors.newPassword} />
                <div className="mt-6"></div>
                <LabelArea label="Confirm Password" />
                <Input
                  label="Confirm Password"
                  name="confirm_password"
                  type="password"
                  autocomplete="current-password"
                  placeholder={t("ConfirmPassword")}
                  {...register("confirm_password", {
                    validate: (value) =>
                      value === password.current ||
                      "The passwords do not match",
                  })}
                />
                <Error errorName={errors.confirm_password} />

                <Button
                  disabled={loading}
                  type="submit"
                  block
                  className="mt-4 h-12"
                >
                  {t("Reset")}
                </Button>
              </form>
              <p className="mt-4 text-center">
                <Link
                  className="text-sm font-medium text-store-500 dark:text-store-400 hover:underline"
                  to="/login"
                >
                  {t("AlreadyAccount")}
                </Link>
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
