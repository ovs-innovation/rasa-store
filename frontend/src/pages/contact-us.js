import React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import useTranslation from "next-translate/useTranslation";
import { FiMail, FiMapPin, FiBell } from "react-icons/fi";

//internal import
import Layout from "@layout/Layout";
import Label from "@components/form/Label";
import Error from "@components/form/Error";
import { notifySuccess } from "@utils/toast";
import useGetSetting from "@hooks/useGetSetting";
import InputArea from "@components/form/InputArea";
import SimpleHeader from "@components/header/SimpleHeader";
import CMSkeleton from "@components/preloader/CMSkeleton";
import useUtilsFunction from "@hooks/useUtilsFunction";

const ContactUs = () => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { showingTranslateValue } = useUtilsFunction();
  const { storeCustomizationSetting, loading, error } = useGetSetting();
  const storeColor = storeCustomizationSetting?.theme?.color || "green";

  const submitHandler = () => {
    notifySuccess(
      "your message sent successfully. We will contact you shortly."
    );
  };

  return (
    <Layout title="Contact Us" description="This is contact us page">
      {/* <SimpleHeader
        title={
          showingTranslateValue(storeCustomizationSetting?.contact_us?.title) ||
          "Contact Us"
        }
      /> */}

      <div className="bg-white">
        <div className="max-w-screen-2xl mx-auto  0 py-10 px-4 sm:px-10">
          {/* contact promo */}
          <div className="grid md:grid-cols-2 gap-6 lg:grid-cols-3 xl:gap-8 font-serif">
            {loading ? (
              <CMSkeleton
                count={10}
                height={20}
                error={error}
                loading={loading}
              />
            ) : (
              <div className="border p-10 rounded-lg text-center">
                <span className={`flex justify-center text-4xl text-store-500 mb-4`}>
                  <FiMail />
                </span>
                <h5 className="text-xl mb-2 font-bold">
                  {showingTranslateValue(
                    storeCustomizationSetting?.contact_us?.email_box_title
                  )}
                </h5>
                <p className="mb-0 text-base opacity-90 leading-7 md:text-justify">
                  <a
                    href={`mailto:${storeCustomizationSetting?.contact_us?.email_box_email}`}
                    className={`text-store-500`}
                  >
                    {showingTranslateValue(
                      storeCustomizationSetting?.contact_us?.email_box_email
                    )}
                  </a>{" "}
                  {showingTranslateValue(
                    storeCustomizationSetting?.contact_us?.email_box_text
                  )}
                </p>
              </div>
            )}

            {loading ? (
              <CMSkeleton
                count={10}
                height={20}
                error={error}
                loading={loading}
              />
            ) : (
              <div className="border p-10 rounded-lg text-center md:text-justify ">
                <span className={`flex justify-center text-4xl text-store-500 mb-4`}>
                  <FiBell />
                </span>
                <h5 className="text-xl mb-2 font-bold">
                  {showingTranslateValue(
                    storeCustomizationSetting?.contact_us?.call_box_title
                  )}
                </h5>
                <p className="mb-0 text-base opacity-90 leading-7">
                  <a
                    href={`mailto:${storeCustomizationSetting?.contact_us?.call_box_phone}`}
                    className={`text-store-500`}
                  >
                    {showingTranslateValue(
                      storeCustomizationSetting?.contact_us?.call_box_phone
                    )}
                  </a>{" "}
                  {showingTranslateValue(
                    storeCustomizationSetting?.contact_us?.call_box_text
                  )}
                </p>
              </div>
            )}
            {loading ? (
              <CMSkeleton
                count={10}
                height={20}
                error={error}
                loading={loading}
              />
            ) : (
              <div className="border p-10 rounded-lg text-center">
                <span className={`flex justify-center text-4xl text-store-500 mb-4`}>
                  <FiMapPin />
                </span>
                <h5 className="text-xl mb-2 font-bold">
                  {showingTranslateValue(
                    storeCustomizationSetting?.contact_us?.address_box_title
                  )}
                </h5>
                <p className="mb-0 text-base opacity-90 leading-7">
                  <span>
                    {showingTranslateValue(
                      storeCustomizationSetting?.contact_us
                        ?.address_box_address_one
                    )}
                  </span>{" "}
                  <br />
                  {showingTranslateValue(
                    storeCustomizationSetting?.contact_us
                      ?.address_box_address_two
                  )}{" "}
                  <br />
                  {showingTranslateValue(
                    storeCustomizationSetting?.contact_us
                      ?.address_box_address_three
                  )}
                </p>
              </div>
            )}
          </div>

          {/* contact form */}
          <div className="px-0 pt-24 mx-auto items-center flex flex-col md:flex-row w-full justify-center gap-28">
            <div className="hidden md:w-full lg:w-4/12 lg:flex flex-col h-full">
              <Image
                width={874}
                height={874}
                src={
                  storeCustomizationSetting?.contact_us?.left_col_img ||
                  "/contact-us.png"
                }
                alt="logo"
                className="block w-auto"
              />
            </div>
            <div className="px-0 pb-2 lg:w-5/12 flex flex-col md:flex-row w-full">
              <form
                onSubmit={handleSubmit(submitHandler)}
                className="w-full mx-auto flex flex-col justify-center bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-100 relative overflow-hidden"
              >
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-store-50 opacity-50 pointer-events-none"></div>
                <div className="relative z-10 w-full flex flex-col justify-center">
                <div className="mb-12">
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold font-serif mb-3">
                    <CMSkeleton
                      count={1}
                      height={50}
                      loading={loading}
                      data={storeCustomizationSetting?.contact_us?.form_title}
                    />
                  </h3>
                  <p className="text-base opacity-90 leading-7">
                    <CMSkeleton
                      count={2}
                      height={20}
                      loading={loading}
                      data={
                        storeCustomizationSetting?.contact_us?.form_description
                      }
                    />
                  </p>
                </div>

                <div className="w-full flex flex-col space-y-5">
                  <div className="w-full flex flex-col md:flex-row space-y-5 md:space-y-0">
                    <div className="w-full md:w-1/2 ">
                      <InputArea
                        register={register}
                        label={t("Your Name")}
                        name="name"
                        type="text"
                        placeholder={t(
                          " Your name"
                        )}
                      />
                      <Error errorName={errors.name} />
                    </div>
                    <div className="w-full md:w-1/2 md:ml-2.5 lg:ml-5 mt-2 md:mt-0">
                      <InputArea
                        register={register}
                        label={t("Your email")}
                        name="email"
                        type="email"
                        placeholder={t(
                          " Your email"
                        )}
                      />
                      <Error errorName={errors.email} />
                    </div>
                  </div>
                  <div className="relative">
                    <InputArea
                      register={register}
                      label={t("Subject")}
                      name="subject"
                      type="text"
                      placeholder={t(
                        " Enter Your Subject"
                      )}
                    />
                    <Error errorName={errors.subject} />
                  </div>
                  <div className="relative mb-4">
                    <Label
                      label={t("Message")}
                    />
                    <textarea
                      {...register("message", {
                        required: `Message is required!`,
                      })}
                      name="message"
                      className="px-4 py-3 flex items-center w-full rounded appearance-none opacity-75 transition duration-300 ease-in-out text-sm focus:ring-0 bg-white border border-gray-300 focus:shadow-none focus:outline-none focus:border-gray-500 placeholder-body"
                      autoComplete="off"
                      spellCheck="false"
                      rows="4"
                      placeholder={t(
                        " Your message"
                      )}
                    ></textarea>
                    <Error errorName={errors.message} />
                  </div>
                  <div className="relative mt-2">
                    <button
                      type="submit"
                      data-variant="flat"
                      className="w-full bg-gradient-to-r from-store-500 to-store-600 hover:from-store-600 hover:to-store-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-base md:text-lg"
                    >
                      {t("Send Message")}
                    </button>
                  </div>
                </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactUs;
