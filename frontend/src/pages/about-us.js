import React from "react";
import Image from "next/image";

//internal import
import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import SimpleHeader from "@components/header/SimpleHeader";
import CMSkeleton from "@components/preloader/CMSkeleton";
import useUtilsFunction from "@hooks/useUtilsFunction";

const AboutUs = () => {
  const { storeCustomizationSetting, loading, error } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  return (
    <Layout title="About Us" description="This is about us page">
      {/* <SimpleHeader
        title={
          showingTranslateValue(storeCustomizationSetting?.about_us?.title) ||
          "About Us"
        }
      /> */}

      <div className="bg-white pt-8 lg:pt-16">
        <div className="max-w-screen-2xl mx-auto pb-10 px-4 sm:px-10">
          <div className="grid grid-flow-row lg:grid-cols-2 gap-4 lg:gap-16 items-center">
            <div className="">
              <h3 className="text-xl lg:text-3xl mb-2 font-serif font-semibold text-justify">
                {/* {t("common:about-section-title")} */}

                <CMSkeleton
                  count={1}
                  height={50}
                  loading={loading}
                  data={storeCustomizationSetting?.about_us?.top_title || "About Farmacykart"}
                />
              </h3>
              <div className="mt-3 text-base opacity-90 leading-7 text-justify">
                <p>
                  <CMSkeleton
                    count={5}
                    height={20}
                    loading={loading}
                    data={storeCustomizationSetting?.about_us?.top_description || "Founded in 2020 in the heart of Ghaziabad, Uttar Pradesh, Farmacykart was built on a simple idea: health and daily essentials should never be hard to reach. We are a proud Indian multi-vendor e-commerce platform that connects families with licensed medicine distributors, local pharmacies, and quality grocery vendors."}
                  />
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6 lg:grid-cols-2 xl:gap-6 mt-8">
                <div className="p-8 bg-indigo-50 shadow-sm rounded-lg">
                  {loading ? (
                    <CMSkeleton
                      count={8}
                      height={20}
                      error={error}
                      loading={loading}
                    />
                  ) : (
                    <>
                      <span className="text-3xl block font-extrabold font-serif mb-4 text-gray-800">
                        {showingTranslateValue(
                          storeCustomizationSetting?.about_us?.card_two_title
                        ) || "Our Mission"}
                      </span>
                      <h4 className="text-lg font-serif font-bold mb-1">
                        {showingTranslateValue(
                          storeCustomizationSetting?.about_us?.card_two_sub
                        ) || "Healthcare & Groceries"}
                      </h4>
                      <p className="mb-0 opacity-90 leading-7">
                        {showingTranslateValue(
                          storeCustomizationSetting?.about_us
                            ?.card_two_description
                        ) || "To simplify healthcare and daily shopping for Indian households by offering a reliable, transparent, and user-friendly home delivery platform."}
                      </p>
                    </>
                  )}
                </div>
                <div className="p-8 bg-indigo-50 shadow-sm rounded-lg">
                  {loading ? (
                    <CMSkeleton
                      count={8}
                      height={20}
                      error={error}
                      loading={loading}
                    />
                  ) : (
                    <>
                      <span className="text-3xl block font-extrabold font-serif mb-4 text-gray-800">
                        {showingTranslateValue(
                          storeCustomizationSetting?.about_us?.card_one_title
                        ) || "What We Do"}
                      </span>
                      <h4 className="text-lg font-serif font-bold mb-1">
                        {showingTranslateValue(
                          storeCustomizationSetting?.about_us?.card_one_sub
                        ) || "Unified online platform"}
                      </h4>
                      <p className="mb-0 opacity-90 leading-7">
                        {showingTranslateValue(
                          storeCustomizationSetting?.about_us
                            ?.card_one_description
                        ) || "We provide a unified online platform where you can buy prescription drugs, over-the-counter medicines, personal care items, and daily groceries."}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <img
                width={900}
                height={720}
                src={
                  storeCustomizationSetting?.about_us?.content_right_img ||
                  "/about-us.jpg"
                }
                alt="logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="mt-10 lg:mt-16 text-base opacity-90 leading-7 text-justify">
            <p>
              <CMSkeleton
                count={5}
                height={20}
                loading={loading}
                data={
                  storeCustomizationSetting?.about_us?.middle_description_one || "At Farmacykart, our mission is to make healthcare and daily essentials accessible, affordable, and highly convenient for every household in Ghaziabad and beyond."
                }
              />
            </p>

            <p>
              <CMSkeleton
                count={8}
                height={20}
                error={error}
                loading={loading}
                data={
                  storeCustomizationSetting?.about_us?.middle_description_two || "We proudly support and connect local Ghaziabad businesses with the community they serve. By bringing local vendors online, we ensure that you get lightning-fast delivery of 100% genuine products."
                }
              />
            </p>
          </div>
          {/* <div className="mt-10 lg:mt-12 flex flex-col sm:grid gap-4">
            <Image
              width={1020}
              height={570}
              src={
                storeCustomizationSetting?.about_us?.content_middle_Img ||
                "/about-banner.jpg"
              }
              alt="logo"
              className="block rounded-lg"
            />
          </div> */}
        </div>
        <div className="bg-gray-50 ">
          <div className="max-w-screen-2xl mx-auto px-3 sm:px-10">
            {/* <div className="relative flex flex-col sm:flex-row sm:items-end justify-between mb-8">
              <div className="max-w-2xl">
                <h3 className="text-xl lg:text-3xl mb-2 font-serif font-semibold text-justify">
                  <CMSkeleton
                    count={1}
                    height={50}
                    loading={loading}
                    data={storeCustomizationSetting?.about_us?.founder_title}
                  />
                </h3>
                <p className="mt-2 md:mt-3 font-normal block text-base">
                  <CMSkeleton
                    count={3}
                    height={20}
                    loading={loading}
                    data={
                      storeCustomizationSetting?.about_us?.founder_description
                    }
                  />
                </p>
              </div>
            </div> */}
            {/* <div className="grid sm:grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-6 xl:gap-x-8">
              <div className="max-w-sm">
                <Image
                  width={420}
                  height={420}
                  src={
                    storeCustomizationSetting?.about_us?.founder_one_img ||
                    "/team/team-1.jpg"
                  }
                  alt="team-1"
                  className="block rounded-lg"
                />
                <div className="py-4">
                  <h5 className="text-lg font-semibold font-serif">
                    {showingTranslateValue(
                      storeCustomizationSetting?.about_us?.founder_one_name
                    )}
                  </h5>
                  <span className="opacity-75 text-sm">
                    {showingTranslateValue(
                      storeCustomizationSetting?.about_us?.founder_one_sub
                    )}
                  </span>
                </div>
              </div>
              <div className="max-w-sm">
                <Image
                  width={420}
                  height={420}
                  src={
                    storeCustomizationSetting?.about_us?.founder_two_img ||
                    "/team/team-2.jpg"
                  }
                  alt="team-2"
                  className="block rounded-lg"
                />
                <div className="py-4">
                  <h5 className="text-lg font-semibold font-serif">
                    {showingTranslateValue(
                      storeCustomizationSetting?.about_us?.founder_two_name
                    )}
                  </h5>
                  <span className="opacity-75 text-sm">
                    {showingTranslateValue(
                      storeCustomizationSetting?.about_us?.founder_two_sub
                    )}
                  </span>
                </div>
              </div>
              <div className="max-w-sm">
                <Image
                  width={420}
                  height={420}
                  src={
                    storeCustomizationSetting?.about_us?.founder_three_img ||
                    "/team/team-3.jpg"
                  }
                  alt="team-3"
                  className="block rounded-lg"
                />
                <div className="py-4">
                  <h5 className="text-lg font-semibold font-serif">
                    {showingTranslateValue(
                      storeCustomizationSetting?.about_us?.founder_three_name
                    )}
                  </h5>
                  <span className="opacity-75 text-sm">
                    {showingTranslateValue(
                      storeCustomizationSetting?.about_us?.founder_three_sub
                    )}
                  </span>
                </div>
              </div>
              <div className="max-w-sm">
                <Image
                  width={420}
                  height={420}
                  src={
                    storeCustomizationSetting?.about_us?.founder_four_img ||
                    "/team/team-4.jpg"
                  }
                  alt="team-4"
                  className="block rounded-lg"
                />
                <div className="py-4">
                  <h5 className="text-lg font-semibold font-serif">
                    {showingTranslateValue(
                      storeCustomizationSetting?.about_us?.founder_four_name
                    )}
                  </h5>
                  <span className="opacity-75 text-sm">
                    {showingTranslateValue(
                      storeCustomizationSetting?.about_us?.founder_four_sub
                    )}
                  </span>
                </div>
              </div>
              <div className="max-w-sm">
                <Image
                  width={420}
                  height={420}
                  src={
                    storeCustomizationSetting?.about_us?.founder_five_img ||
                    "/team/team-5.jpg"
                  }
                  alt="team-5"
                  className="block rounded-lg"
                />
                <div className="py-4">
                  <h5 className="text-lg font-semibold font-serif">
                    {showingTranslateValue(
                      storeCustomizationSetting?.about_us?.founder_five_name
                    )}
                  </h5>
                  <span className="opacity-75 text-sm">
                    {showingTranslateValue(
                      storeCustomizationSetting?.about_us?.founder_five_sub
                    )}
                  </span>
                </div>
              </div>
              <div className="max-w-sm">
                <Image
                  width={420}
                  height={420}
                  src={
                    storeCustomizationSetting?.about_us?.founder_six_img ||
                    "/team/team-6.jpg"
                  }
                  alt="team-6"
                  className="block rounded-lg"
                />
                <div className="py-4">
                  <h5 className="text-lg font-semibold font-serif">
                    {showingTranslateValue(
                      storeCustomizationSetting?.about_us?.founder_six_name
                    )}
                  </h5>
                  <span className="opacity-75 text-sm">
                    {showingTranslateValue(
                      storeCustomizationSetting?.about_us?.founder_six_sub
                    )}
                  </span>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutUs;
