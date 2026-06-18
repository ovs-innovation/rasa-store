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

      <div className="bg-black text-white">
        <div className="max-w-screen-2xl mx-auto py-10 px-4 sm:px-10">
          {/* contact promo */}
          <div className="grid md:grid-cols-2 gap-6 lg:grid-cols-3 xl:gap-8 font-sans">
            {loading ? (
              <CMSkeleton
                count={10}
                height={20}
                error={error}
                loading={loading}
              />
            ) : (
              <div className="border border-neutral-900 bg-[#0A0A0A] p-10 rounded-2xl text-center">
                <span className="flex justify-center text-4xl text-[#D4AF37] mb-4">
                  <FiMail />
                </span>
                <h5 className="text-xl mb-2 font-black uppercase tracking-wide">
                  {showingTranslateValue(
                    storeCustomizationSetting?.contact_us?.email_box_title
                  ) || "Email Us"}
                </h5>
                <p className="mb-0 text-sm text-neutral-400 leading-7">
                  <a
                    href={`mailto:${storeCustomizationSetting?.contact_us?.email_box_email || "support@therasastore.com"}`}
                    className="text-[#D4AF37] hover:underline"
                  >
                    {showingTranslateValue(
                      storeCustomizationSetting?.contact_us?.email_box_email
                    ) || "support@therasastore.com"}
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
              <div className="border border-neutral-900 bg-[#0A0A0A] p-10 rounded-2xl text-center">
                <span className="flex justify-center text-4xl text-[#D4AF37] mb-4">
                  <FiBell />
                </span>
                <h5 className="text-xl mb-2 font-black uppercase tracking-wide">
                  {showingTranslateValue(
                    storeCustomizationSetting?.contact_us?.call_box_title
                  ) || "Call Us"}
                </h5>
                <p className="mb-0 text-sm text-neutral-400 leading-7">
                  <a
                    href={`tel:${storeCustomizationSetting?.contact_us?.call_box_phone || "+3314000000"}`}
                    className="text-[#D4AF37] hover:underline"
                  >
                    {showingTranslateValue(
                      storeCustomizationSetting?.contact_us?.call_box_phone
                    ) || "+33 (1) 4000-0000"}
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
              <div className="border border-neutral-900 bg-[#0A0A0A] p-10 rounded-2xl text-center">
                <span className="flex justify-center text-4xl text-[#D4AF37] mb-4">
                  <FiMapPin />
                </span>
                <h5 className="text-xl mb-2 font-black uppercase tracking-wide">
                  {showingTranslateValue(
                    storeCustomizationSetting?.contact_us?.address_box_title
                  ) || "HQ Office"}
                </h5>
                <p className="mb-0 text-sm text-neutral-400 leading-7">
                  <span>
                    {showingTranslateValue(
                      storeCustomizationSetting?.contact_us
                        ?.address_box_address_one
                    ) || "102 Luxury Retail District"}
                  </span>{" "}
                  <br />
                  {showingTranslateValue(
                    storeCustomizationSetting?.contact_us
                      ?.address_box_address_two
                  ) || "Avenue des Champs-Élysées"}{" "}
                  <br />
                  {showingTranslateValue(
                    storeCustomizationSetting?.contact_us
                      ?.address_box_address_three
                  ) || "Paris, France"}
                </p>
              </div>
            )}
          </div>

          {/* contact form */}
          <div className="px-0 pt-24 mx-auto items-center flex flex-col lg:flex-row w-full justify-center gap-20">
            <div className="hidden md:w-full lg:w-4/12 lg:flex flex-col h-full rounded-2xl overflow-hidden border border-neutral-900">
              <Image
                width={874}
                height={874}
                src={
                  storeCustomizationSetting?.contact_us?.left_col_img ||
                  "/contact-us.png"
                }
                alt="logo"
                className="block w-auto object-cover"
              />
            </div>
            <div className="px-0 pb-2 lg:w-5/12 flex flex-col md:flex-row w-full">
              <form
                onSubmit={handleSubmit(submitHandler)}
                className="w-full mx-auto flex flex-col justify-center bg-[#0A0A0A] p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl border border-neutral-900 relative overflow-hidden"
              >
                <div className="relative z-10 w-full flex flex-col justify-center">
                <div className="mb-10">
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tight text-white mb-3">
                    <CMSkeleton
                      count={1}
                      height={50}
                      loading={loading}
                      data={storeCustomizationSetting?.contact_us?.form_title || "Get In Touch"}
                    />
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    <CMSkeleton
                      count={2}
                      height={20}
                      loading={loading}
                      data={
                        storeCustomizationSetting?.contact_us?.form_description || "Have any questions or need custom styling assistance? Drop us a line below."
                      }
                    />
                  </p>
                </div>

                <div className="w-full flex flex-col space-y-5">
                  <div className="w-full flex flex-col md:flex-row space-y-5 md:space-y-0 gap-4">
                    <div className="w-full md:w-1/2 ">
                      <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">{t("Your Name")}</label>
                      <input
                        {...register("name", { required: "Name is required" })}
                        type="text"
                        placeholder="Your name"
                        className="w-full px-4 py-3 bg-[#050505] text-white border border-neutral-800 rounded-lg focus:outline-none focus:border-[#D4AF37] text-sm"
                      />
                      <Error errorName={errors.name} />
                    </div>
                    <div className="w-full md:w-1/2 mt-2 md:mt-0">
                      <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">{t("Your email")}</label>
                      <input
                        {...register("email", { required: "Email is required" })}
                        type="email"
                        placeholder="Your email"
                        className="w-full px-4 py-3 bg-[#050505] text-white border border-neutral-800 rounded-lg focus:outline-none focus:border-[#D4AF37] text-sm"
                      />
                      <Error errorName={errors.email} />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">{t("Subject")}</label>
                    <input
                      {...register("subject", { required: "Subject is required" })}
                      type="text"
                      placeholder="Enter Your Subject"
                      className="w-full px-4 py-3 bg-[#050505] text-white border border-neutral-800 rounded-lg focus:outline-none focus:border-[#D4AF37] text-sm"
                    />
                    <Error errorName={errors.subject} />
                  </div>
                  <div className="relative mb-4">
                    <label className="block text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">{t("Message")}</label>
                    <textarea
                      {...register("message", {
                        required: `Message is required!`,
                      })}
                      name="message"
                      className="px-4 py-3 flex items-center w-full rounded-lg transition duration-300 ease-in-out text-sm bg-[#050505] text-white border border-neutral-800 focus:outline-none focus:border-[#D4AF37] placeholder-neutral-600"
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
                      className="w-full bg-[#D4AF37] hover:bg-[#bfa232] text-black font-extrabold py-3.5 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
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
