import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@windmill/react-ui";

//internal import
import Error from "@/components/form/others/Error";
import useLoginSubmit from "@/hooks/useLoginSubmit";
import LabelArea from "@/components/form/selectOption/LabelArea";
import InputArea from "@/components/form/input/InputArea";
import { ADMIN_BRAND_LOGO } from "@/utils/cloudinaryUrl";

const ForgotPassword = () => {
  const { onSubmit, register, handleSubmit, errors, loading } =
    useLoginSubmit();

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
                Forgot password
              </h1>

              <form onSubmit={handleSubmit(onSubmit)}>
                <LabelArea label="Email" />
                <InputArea
                  required={true}
                  register={register}
                  label="Email"
                  name="verifyEmail"
                  type="email"
                  placeholder="john@doe.com"
                />
                <Error errorName={errors.verifyEmail} />

                <Button
                  disabled={loading}
                  type="submit"
                  block
                  className="mt-4 h-12"
                >
                  Recover password
                </Button>
              </form>
              <p className="mt-4 text-center">
                <Link
                  className="text-sm font-medium text-store-500 dark:text-store-400 hover:underline"
                  to="/login"
                >
                  Already have an account? Login
                </Link>
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
