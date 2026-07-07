import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import ProductCard from "@components/product/ProductCard";
import ClientOnly from "@components/common/ClientOnly";

const RelatedCarouselFallback = ({ products, attributes }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
    {products.slice(0, 5).map((product) => (
      <ProductCard key={product._id} product={product} attributes={attributes} />
    ))}
  </div>
);

const RelatedProductsSection = ({ products = [], attributes, title = "You may also like" }) => {
  if (!products.length) return null;

  const prevClass = "related-products-prev";
  const nextClass = "related-products-next";
  const paginationClass = "related-products-pagination";

  const carousel = (
    <div className="relative group">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={12}
        slidesPerView={2}
        navigation={{ prevEl: `.${prevClass}`, nextEl: `.${nextClass}` }}
        pagination={{
          el: `.${paginationClass}`,
          clickable: true,
          dynamicBullets: true,
        }}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 14 },
          768: { slidesPerView: 3, spaceBetween: 16 },
          1024: { slidesPerView: 4, spaceBetween: 18 },
          1280: { slidesPerView: 5, spaceBetween: 20 },
        }}
        className="related-products-swiper !pb-1"
      >
        {products.map((product) => (
          <SwiperSlide key={product._id}>
            <ProductCard product={product} attributes={attributes} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        className={`${paginationClass} flex justify-center mt-6 md:hidden [&_.swiper-pagination-bullet]:bg-neutral-600 [&_.swiper-pagination-bullet-active]:bg-[#D4AF37]`}
      />

      <button
        type="button"
        aria-label="Previous related products"
        className={`${prevClass} absolute top-[42%] left-0 z-10 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-800 bg-[#111]/95 p-2.5 text-white transition-colors hover:border-[#D4AF37]/40 sm:block md:opacity-0 md:group-hover:opacity-100`}
      >
        <IoChevronBack className="text-base" />
      </button>
      <button
        type="button"
        aria-label="Next related products"
        className={`${nextClass} absolute top-[42%] right-0 z-10 hidden translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-800 bg-[#111]/95 p-2.5 text-white transition-colors hover:border-[#D4AF37]/40 sm:block md:opacity-0 md:group-hover:opacity-100`}
      >
        <IoChevronForward className="text-base" />
      </button>
    </div>
  );

  return (
    <section className="border-t border-neutral-900 bg-[#0A0A0A] py-12 lg:py-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Related
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-white mt-1">{title}</h2>
          </div>
        </div>

        <ClientOnly fallback={<RelatedCarouselFallback products={products} attributes={attributes} />}>
          {carousel}
        </ClientOnly>
      </div>
    </section>
  );
};

export default RelatedProductsSection;
