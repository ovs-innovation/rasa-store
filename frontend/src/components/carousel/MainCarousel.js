import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Controller, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

//internal import

import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";

const MainCarousel = () => {
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue, showingUrl, showingImage } =
    useUtilsFunction();

  const backendSliderData = [
    {
      id: 1,

      title: showingTranslateValue(
        storeCustomizationSetting?.slider?.first_title
      ),
      info: showingTranslateValue(
        storeCustomizationSetting?.slider?.first_description
      ),
      buttonName: showingTranslateValue(
        storeCustomizationSetting?.slider?.first_button
      ),
      url: showingUrl(storeCustomizationSetting?.slider?.first_link),
      image: showingImage(storeCustomizationSetting?.slider?.first_img),
    },
    {
      id: 2,
      title: showingTranslateValue(
        storeCustomizationSetting?.slider?.second_title
      ),
      info: showingTranslateValue(
        storeCustomizationSetting?.slider?.second_description
      ),
      buttonName: showingTranslateValue(
        storeCustomizationSetting?.slider?.second_button
      ),
      url: showingUrl(storeCustomizationSetting?.slider?.second_link),
      image: showingImage(storeCustomizationSetting?.slider?.second_img),
    },
    {
      id: 3,
      title: showingTranslateValue(
        storeCustomizationSetting?.slider?.third_title
      ),
      info: showingTranslateValue(
        storeCustomizationSetting?.slider?.third_description
      ),
      buttonName: showingTranslateValue(
        storeCustomizationSetting?.slider?.third_button
      ),
      url: showingUrl(storeCustomizationSetting?.slider?.third_link),
      image: showingImage(storeCustomizationSetting?.slider?.third_img),
    },
    {
      id: 4,
      title: showingTranslateValue(
        storeCustomizationSetting?.slider?.four_title
      ),
      info: showingTranslateValue(
        storeCustomizationSetting?.slider?.four_description
      ),
      buttonName: showingTranslateValue(
        storeCustomizationSetting?.slider?.four_button
      ),
      url: showingUrl(storeCustomizationSetting?.slider?.four_link),
      image: showingImage(storeCustomizationSetting?.slider?.four_img),
    },
    {
      id: 5,
      title: showingTranslateValue(
        storeCustomizationSetting?.slider?.five_title
      ),
      info: showingTranslateValue(
        storeCustomizationSetting?.slider?.five_description
      ),
      buttonName: showingTranslateValue(
        storeCustomizationSetting?.slider?.five_button
      ),
      url: showingUrl(storeCustomizationSetting?.slider?.five_link),
      image: showingImage(storeCustomizationSetting?.slider?.five_img),
    },
  ].filter(item => item.image);

  const defaultSliderData = [
    { id: 1, title: "", info: "", buttonName: "", url: "#", image: "/slider/slider-1.png" },
    { id: 2, title: "", info: "", buttonName: "", url: "#", image: "/slider/slider-2.jpg" },
    { id: 3, title: "", info: "", buttonName: "", url: "#", image: "/slider/slider-3.jpg" },
  ];

  const sliderData = backendSliderData.length > 0 ? backendSliderData : defaultSliderData;

  return (
    <>
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        loop={sliderData?.length >= 2}
        pagination={
          (storeCustomizationSetting?.slider?.bottom_dots ||
            storeCustomizationSetting?.slider?.both_slider) && {
            clickable: true,
          }
        }
        navigation={
          (storeCustomizationSetting?.slider?.left_right_arrow ||
            storeCustomizationSetting?.slider?.both_slider) && {
            clickable: true,
          }
        }
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper"
      >
        {sliderData?.map((item, i) => (
          <SwiperSlide
            key={i + 1}
            className="w-full relative overflow-hidden rounded-none"
          >
            <div className="relative w-full h-[220px] sm:h-[320px] md:h-[480px] lg:h-[640px]">
              <Image
                src={item.image || "/slider/slider-1.jpg"}
                alt={item.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
              />
            </div>

            <div className="absolute inset-0 z-10 flex flex-col p-4 sm:p-10 items-start justify-center">
              <div className="pl-0 pr-0 sm:pl-10 sm:pr-16 w-10/12 lg:w-8/12 xl:w-7/12">
                <h1 className="mb-2 font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
                  {item.title}
                </h1>
                <p className="text-sm sm:text-base leading-5 sm:leading-6 text-gray-600 font-sans line-clamp-3 sm:line-clamp-none">
                  {item.info}
                </p>
                {/* <Link
                  href={item.url}
                  className={`hidden sm:inline-block lg:inline-block text-sm leading-6 font-serif font-medium mt-6 px-6 py-2 bg-${storeCustomizationSetting?.theme?.color || 'green'}-500 text-center rounded-md text-white hover:bg-${storeCustomizationSetting?.theme?.color || 'green'}-600`}
                >
                  {item.buttonName}
                </Link> */}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default MainCarousel;
