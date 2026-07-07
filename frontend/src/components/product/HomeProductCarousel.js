import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";

import ProductCard from "@components/product/ProductCard";
import ClientOnly from "@components/common/ClientOnly";

const CarouselFallback = ({ products, attributes }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
    {products.slice(0, 5).map((product) => (
      <ProductCard key={product._id} product={product} attributes={attributes} />
    ))}
  </div>
);

const HomeProductCarousel = ({ products, attributes, prevClass, nextClass, paginationClass }) => {
  if (!products?.length) return null;

  const carousel = (
    <div className="relative group">
      <Swiper
        modules={[Navigation, Autoplay, Pagination]}
        spaceBetween={12}
        slidesPerView={1.08}
        centeredSlides
        loop={products.length >= 3}
        navigation={{ prevEl: `.${prevClass}`, nextEl: `.${nextClass}` }}
        pagination={{
          el: `.${paginationClass}`,
          clickable: true,
          dynamicBullets: true,
        }}
        autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 16, centeredSlides: false },
          768: { slidesPerView: 3, spaceBetween: 18, centeredSlides: false },
          1024: { slidesPerView: 4, spaceBetween: 20, centeredSlides: false },
          1280: { slidesPerView: 5, spaceBetween: 20, centeredSlides: false },
        }}
        className="home-product-swiper !pb-1 !pt-1"
      >
        {products.map((product) => (
          <SwiperSlide key={product._id}>
            <div className="mx-auto w-full max-w-[260px] sm:mx-0 sm:max-w-none">
              <ProductCard product={product} attributes={attributes} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className={`${paginationClass} home-swiper-pagination !static flex justify-center mt-6 md:hidden`} />
      <button
        type="button"
        aria-label="Previous products"
        className={`${prevClass} absolute top-[42%] left-0 z-10 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-800 bg-[#111]/95 p-2.5 transition-colors hover:border-[#D4AF37]/40 sm:block md:opacity-0 md:group-hover:opacity-100`}
      >
        <IoChevronBack className="text-base text-white" />
      </button>
      <button
        type="button"
        aria-label="Next products"
        className={`${nextClass} absolute top-[42%] right-0 z-10 hidden translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-800 bg-[#111]/95 p-2.5 transition-colors hover:border-[#D4AF37]/40 sm:block md:opacity-0 md:group-hover:opacity-100`}
      >
        <IoChevronForward className="text-base text-white" />
      </button>
    </div>
  );

  return (
    <ClientOnly fallback={<CarouselFallback products={products} attributes={attributes} />}>
      {carousel}
    </ClientOnly>
  );
};

export default HomeProductCarousel;
