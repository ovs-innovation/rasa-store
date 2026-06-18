import React from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { IoChevronBack, IoChevronForward, IoArrowForwardOutline } from "react-icons/io5";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Internal imports
import useGetSetting from "@hooks/useGetSetting";
import { getPalette } from "@utils/themeColors";
import SectionHeader from "@components/common/SectionHeader";

const CategoryCards = () => {
  const router = useRouter();
  const { storeCustomizationSetting } = useGetSetting();
  const storeColor = storeCustomizationSetting?.theme?.color || "green";
  const palette = getPalette(storeColor);

  const categories = [
    {
      id: 1,
      title: "Oversized Fit",
      description: "Heavyweight hoodies, relaxed loopbacks, and daily drop tees.",
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=400&auto=format&fit=crop",
      searchQuery: "unisex-clothing",
      accent: "bg-black",
      lightAccent: "bg-neutral-50",
    },
    {
      id: 2,
      title: "Signature Denim",
      description: "Distressed denim overjackets and rugged vintage layers.",
      image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=400&auto=format&fit=crop",
      searchQuery: "unisex-clothing",
      accent: "bg-black",
      lightAccent: "bg-neutral-50",
    },
    {
      id: 3,
      title: "Luxe Footwear",
      description: "Minimalist Italian leather sneakers and high-top trainers.",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop",
      searchQuery: "footwear",
      accent: "bg-black",
      lightAccent: "bg-neutral-50",
    },
    {
      id: 4,
      title: "Minimal Accessories",
      description: "Gold dial chronographs, corduroy caps, and acetate shades.",
      image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=400&auto=format&fit=crop",
      searchQuery: "accessories",
      accent: "bg-black",
      lightAccent: "bg-neutral-50",
    },
  ];

  return (
    <div className="relative py-12 sm:py-20 overflow-hidden bg-[#FAF9F6] my-4">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-amber-100/10 rounded-none blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] bg-neutral-100/40 rounded-none blur-[80px]" />
      </div>

      <div className="mx-auto max-w-screen-2xl px-4 sm:px-10 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black text-white text-[10px] font-extrabold uppercase tracking-widest shadow-sm mb-4 rounded-none">
              <span className="w-1.5 h-1.5 rounded-none bg-[#D4AF37] animate-pulse" />
              <span>Signature Concept</span>
            </div>
            <SectionHeader title="Shop by Departments" subtitle="Explore our curated lifestyle concepts designed for the modern Gen-Z aesthetic." align="left" />
          </div>

          {/* Custom Navigation buttons for Desktop */}
          <div className="hidden md:flex gap-3">
            <button className="category-prev p-3 rounded-none bg-white border border-neutral-200 text-gray-600 hover:bg-black hover:text-[#D4AF37] transition-all shadow-sm active:scale-95">
              <IoChevronBack size={20} />
            </button>
            <button className="category-next p-3 rounded-none bg-white border border-neutral-200 text-gray-600 hover:bg-black hover:text-[#D4AF37] transition-all shadow-sm active:scale-95">
              <IoChevronForward size={20} />
            </button>
          </div>
        </div>

        <div className="relative">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1.2}
            centeredSlides={false}
            breakpoints={{
              480: { slidesPerView: 1.5, spaceBetween: 20 },
              640: { slidesPerView: 2.2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 30 },
              1280: { slidesPerView: 4, spaceBetween: 30 },
            }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            navigation={{ prevEl: ".category-prev", nextEl: ".category-next" }}
            pagination={{ clickable: true, dynamicBullets: true }}
            className="category-cards-swiper !pb-14"
          >
            {categories.map((category) => (
              <SwiperSlide key={category.id} className="h-auto">
                <div
                  className="group relative flex flex-col h-full bg-white rounded-none p-6 border border-neutral-100 hover:border-black shadow-sm transition-all duration-500 cursor-pointer overflow-hidden"
                  onClick={() => router.push(`/search?category=${category.searchQuery}`)}
                >
                  {/* Card Background Accent */}
                  <div className={`absolute top-0 right-0 w-32 h-32 ${category.lightAccent} rounded-none -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-[3] opacity-50`} />

                  {/* Image Container */}
                  <div className="relative w-full h-44 mb-6 flex items-center justify-center z-10">
                    <div className="relative w-40 h-40 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover rounded-none"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <h3 className="text-lg font-black text-black mb-3 group-hover:text-[#D4AF37] transition-colors uppercase tracking-tight">
                      {category.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-6 line-clamp-2 transition-opacity duration-300">
                      {category.description}
                    </p>

                    {/* Interactive Button */}
                    <div className="mt-auto inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-none bg-neutral-50 text-black font-extrabold text-[10px] uppercase tracking-wider group-hover:bg-black group-hover:text-[#D4AF37] transition-all duration-300">
                      View Concept
                      <IoArrowForwardOutline className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <style jsx global>{`
        .category-cards-swiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #E5E5E5;
          opacity: 1;
        }
        .category-cards-swiper .swiper-pagination-bullet-active {
          background: #111111 !important;
          width: 25px;
          border-radius: 0px;
        }
        .category-cards-swiper {
          padding-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default CategoryCards;
