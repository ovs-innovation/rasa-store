import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { IoChevronBack, IoChevronForward, IoFlash } from "react-icons/io5";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

// Internal imports
import useUtilsFunction from "@hooks/useUtilsFunction";
import SectionHeader from "@components/common/SectionHeader";
import ProductCard from "@components/product/ProductCard";

const DealsYouLove = ({ products, attributes }) => {
  const { getNumber } = useUtilsFunction();

  const dealProducts = useMemo(() => {
    if (!products) return [];

    return products
      .map((p) => {
        const retailPrice = getNumber(p?.prices?.price);
        const originalPrice = getNumber(p?.prices?.originalPrice);
        let discountPercent = 0;
        if (originalPrice > retailPrice) {
          discountPercent = Math.round(
            ((originalPrice - retailPrice) / originalPrice) * 100
          );
        }
        return { ...p, discountPercent };
      })
      .filter((p) => p.discountPercent >= 20);
  }, [products, getNumber]);

  if (!dealProducts || dealProducts.length === 0) return null;

  return (
    <div className="relative lg:py-20 py-10 overflow-hidden bg-[#FFF1F2]">
      {/* Dynamic Mesh Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-100/50 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-emerald-100/40 rounded-full blur-[80px]" />
      </div>

      <div className="mx-auto max-w-screen-2xl px-4 sm:px-10 relative z-10">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-600 to-red-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-orange-100">
              <IoFlash className="animate-pulse" /> Hot Deals
            </div>
            <SectionHeader
              title="Deals You'll Love"
              subtitle="Grab these limited-time offers before they're gone!"
              align="left"
            />
          </div>
        </div>

        <div className="relative group/slider">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={16}
            slidesPerView={2}
            navigation={{
              prevEl: ".prev-deals-you-love",
              nextEl: ".next-deals-you-love",
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 16 },
              768: { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
              1280: { slidesPerView: 5, spaceBetween: 24 },
            }}
            className="mySwiper px-2 py-2"
          >
            {dealProducts.map((product) => (
              <SwiperSlide key={product._id}>
                <ProductCard product={product} attributes={attributes} />
              </SwiperSlide>
            ))}
          </Swiper>

          <button className="prev-deals-you-love absolute top-1/2 -left-2 md:-left-4 z-10 bg-white shadow-lg border border-gray-100 rounded-full p-2 hover:bg-orange-50 transition-colors transform -translate-y-1/2 disabled:opacity-50 disabled:cursor-not-allowed">
            <IoChevronBack className="text-xl text-gray-700" />
          </button>
          <button className="next-deals-you-love absolute top-1/2 -right-2 md:-right-4 z-10 bg-white shadow-lg border border-gray-100 rounded-full p-2 hover:bg-orange-50 transition-colors transform -translate-y-1/2 disabled:opacity-50 disabled:cursor-not-allowed">
            <IoChevronForward className="text-xl text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealsYouLove;
