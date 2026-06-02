import React, { useContext, useEffect, useState } from "react";
import Layout from "@layout/Layout";
import FeatureCategory from "@components/category/FeatureCategory";
import SliderCarousel from "@components/carousel/SliderCarousel";
import { SidebarContext } from "@context/SidebarContext";
import { UserContext } from "@context/UserContext";
import CategoryServices from "@services/CategoryServices";
import ProductServices from "@services/ProductServices";
import ProductCard from "@components/product/ProductCard";
import SectionHeader from "@components/common/SectionHeader";
import CMSkeleton from "@components/preloader/CMSkeleton";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import DealsYouLove from "@components/carousel/DealsYouLove";
import { useQuery } from "@tanstack/react-query";

const Categories = () => {
  const { setIsLoading } = useContext(SidebarContext);
  const { state } = useContext(UserContext) || {};
  const isWholesaler = state?.userInfo?.role && state.userInfo.role.toString().toLowerCase() === "wholesaler";
  const [parentCategories, setParentCategories] = useState([]);

  const getCategoryName = (cat) => {
    if (!cat) return "";
    if (cat?.name?.en) return cat.name.en;
    if (cat?.name && typeof cat.name === "object") {
      const keys = Object.keys(cat.name);
      return cat.name[keys[0]] || "";
    }
    return (cat.name && String(cat.name)) || cat.title || "";
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["category"],
    queryFn: async () => await CategoryServices.getShowingCategory(),
  });

  const getLevel1Categories = (categories) => {
    if (!categories || !Array.isArray(categories) || categories.length === 0) return [];
    
    // Check if we have a single "Home" or "Root" category that acts as a container
    const homeRoot = categories.find(cat => 
      cat.id === "" || 
      getCategoryName(cat).toLowerCase() === "home"
    );

    if (homeRoot && homeRoot.children && homeRoot.children.length > 0) {
      return homeRoot.children;
    }
    
    // Otherwise, all top-level categories are Level 1
    return categories;
  };

  useEffect(() => {
    if (data && Array.isArray(data)) {
      const level1Categories = getLevel1Categories(data);
      const parentsWithChildren = level1Categories.filter(
        (cat) => Array.isArray(cat.children) && cat.children.length > 0
      );
      setParentCategories(parentsWithChildren);
    }
  }, [data]);

  const { data: bestSellingData, isLoading: loadingBest, error: errorBest } = useQuery({
    queryKey: ["bestSellingProducts"],
    queryFn: async () => {
      const res = await ProductServices.getShowingStoreProducts({});
      // backend may return bestSellingProducts or products directly
      return (res && (res.bestSellingProducts || res.products)) || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const bestSellingProducts = bestSellingData || [];

  useEffect(() => {
    setIsLoading(isLoading);
  }, [isLoading, setIsLoading]);

  return (
    <Layout title="Categories" description="All Categories">
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto mb-8">
          <SliderCarousel />
        </div>
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10 pb-10">
          {parentCategories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Loading categories...</p>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-0">
              <FeatureCategory initialSelectedCategory={parentCategories[0]} />
            </div>
          )}

          {bestSellingProducts?.length > 0 && (
            <div className="bg-white lg:py-16 py-10 mx-auto max-w-screen-2xl px-3 sm:px-10 mt-8">
              <SectionHeader
                title="Best Selling Products"
                subtitle="We have compiled the best selling products for you"
                align="left"
              />
              <div className="flex w-full relative group">
                <div className="w-full">
                  {loadingBest ? (
                    <CMSkeleton count={20} height={20} error={errorBest} loading={loadingBest} />
                  ) : (
                    <>
                      <Swiper
                        modules={[Navigation, Autoplay]}
                        spaceBetween={10}
                        slidesPerView={2}
                        navigation={{
                          prevEl: ".prev-best-selling",
                          nextEl: ".next-best-selling",
                        }}
                        autoplay={{
                          delay: 2500,
                          disableOnInteraction: false,
                          pauseOnMouseEnter: true
                        }}
                        breakpoints={{
                          640: { slidesPerView: 2, spaceBetween: 10 },
                          768: { slidesPerView: 3, spaceBetween: 20 },
                          1024: { slidesPerView: 4, spaceBetween: 20 },
                          1280: { slidesPerView: 5, spaceBetween: 20 },
                        }}
                        className="mySwiper px-2 py-2"
                      >
                        {(isWholesaler ? bestSellingProducts.filter(p => (p.wholePrice && Number(p.wholePrice) > 0) || p.isWholesaler) : bestSellingProducts)?.slice(0, 10).map((product) => (
                          <SwiperSlide key={product._id}>
                            <ProductCard product={product} attributes={[]} />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                      <button className="prev-best-selling absolute top-1/2 -left-2 md:-left-4 z-10 bg-white shadow-lg border border-gray-100 rounded-full p-2 hover:bg-store-50 transition-colors transform -translate-y-1/2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <IoChevronBack className="text-xl text-gray-600" />
                      </button>
                      <button className="next-best-selling absolute top-1/2 -right-2 md:-right-4 z-10 bg-white shadow-lg border border-gray-100 rounded-full p-2 hover:bg-store-50 transition-colors transform -translate-y-1/2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <IoChevronForward className="text-xl text-gray-600" />
                      </button>

                      <div className="flex justify-end mt-4 px-2">
                        <a href="/search?sort=best-selling" className="inline-flex items-center gap-1 text-sm font-semibold text-store-500 border border-store-500 rounded-full px-4 py-1 hover:bg-store-500 hover:text-white transition-colors">
                          View All <IoChevronForward />
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default Categories;
