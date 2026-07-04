import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";

import Layout from "@layout/Layout";
import ProductServices from "@services/ProductServices";
import ProductCard from "@components/product/ProductCard";
import HeroBanner from "@components/banner/HeroBanner";
import AttributeServices from "@services/AttributeServices";
import BrandServices from "@services/BrandServices";
import SectionHeader from "@components/common/SectionHeader";
import ShopByBrandSection from "@components/brand/ShopByBrandSection";
import HomeReviewsSection from "@components/reviews/HomeReviewsSection";
import HomeCategorySection from "@components/category/HomeCategorySection";
import HomeSection, { HomeEyebrow, HomeTitle, HomeViewAll } from "@components/common/HomeSection";

const SectionBlock = ({ eyebrow, title, subtitle, href, viewLabel, children, altBg = false }) => (
  <HomeSection className={altBg ? "bg-[#0A0A0A]" : "bg-[#050505]"}>
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-10">
      <div className="min-w-0">
        {eyebrow && <HomeEyebrow>{eyebrow}</HomeEyebrow>}
        <SectionHeader title={title} subtitle={subtitle} align="left" className="mb-0" />
      </div>
      {href && <HomeViewAll href={href} label={viewLabel} />}
    </div>
    {children}
  </HomeSection>
);

const Home = ({ popularProducts, discountProducts, bestSellingProducts, attributes, brands, rasaHomepage }) => {
  const newArrivals = popularProducts || [];
  const trendingProducts = bestSellingProducts || [];

  const ALLOWED_CATEGORIES = ["shoes", "bags", "shoe", "bag", "sneakers", "footwear", "slides", "accessories"];
  const categories = (rasaHomepage?.categoryBanners || [])
    .filter((cat) => {
      if (!cat?.title || !cat?.image) return false;
      const titleLower = cat.title.toLowerCase();
      return ALLOWED_CATEGORIES.some((allowed) => titleLower.includes(allowed));
    })
    .slice(0, 2)
    .map((cat, idx) => ({
      id: cat.id || `cat-${idx}`,
      title: cat.title,
      image: cat.image,
      slug: cat.slug || "footwear",
    }));

  const displayCategories = categories.length > 0 ? categories : [
    { id: "cat-shoes", title: "Shoes", image: "/uploads/shoes-category.jpg", slug: "footwear" },
    { id: "cat-bags", title: "Bags", image: "/uploads/bags-category.jpg", slug: "bags" },
  ];

  const renderProductCarousel = (products, prevClass, nextClass, paginationClass) => (
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
          640: { slidesPerView: 2, spaceBetween: 16 },
          768: { slidesPerView: 3, spaceBetween: 18 },
          1024: { slidesPerView: 4, spaceBetween: 20 },
          1280: { slidesPerView: 5, spaceBetween: 20 },
        }}
        className="home-product-swiper !pb-1 !pt-1"
      >
        {products.map((product) => (
          <SwiperSlide key={product._id}>
            <div className="mx-auto w-full max-w-[260px] sm:max-w-none">
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
        className={`${nextClass} absolute top-[42%] right-0 z-10 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-800 bg-[#111]/95 p-2.5 transition-colors hover:border-[#D4AF37]/40 sm:block md:opacity-0 md:group-hover:opacity-100`}
      >
        <IoChevronForward className="text-base text-white" />
      </button>
    </div>
  );

  const defaultSectionOrder = ["Hero", "Brands", "Categories", "New Arrival", "Trending", "Reviews"];
  const baseOrder = (rasaHomepage?.sectionOrder || defaultSectionOrder)
    .filter((section) => section !== "Instagram")
    .map((section) => (section === "Newsletter" ? "Reviews" : section));

  const reorderedSectionOrder = (() => {
    const arr = baseOrder.filter((s) => s !== "Categories" && s !== "Reviews" && s !== "Hero");
    const brandsIdx = arr.indexOf("Brands");
    if (brandsIdx !== -1) {
      arr.splice(brandsIdx + 1, 0, "Categories");
    } else {
      arr.unshift("Categories");
    }
    if (!arr.includes("Reviews")) arr.push("Reviews");
    return ["Hero", ...arr];
  })();

  const renderSection = (sectionName) => {
    switch (sectionName) {
      case "Hero":
        return <HeroBanner key="Hero" cmsSlides={rasaHomepage?.heroSlides || []} />;
      case "Brands":
        return (
          <ShopByBrandSection
            key="Brands"
            brands={brands}
            enabled={rasaHomepage?.brandsSectionEnabled !== false}
          />
        );
      case "New Arrival":
        return newArrivals.length > 0 && (
          <SectionBlock
            key="New Arrival"
            eyebrow="Fresh in"
            title="New Arrivals"
            subtitle="Latest sneakers, bags and streetwear drops"
            href="/new-arrivals"
            viewLabel="View All"
          >
            {renderProductCarousel(newArrivals, "prev-new-arrivals", "next-new-arrivals", "pag-new-arrivals")}
          </SectionBlock>
        );
      case "Trending":
        return trendingProducts.length > 0 && (
          <SectionBlock
            key="Trending"
            eyebrow="Most wanted"
            title="Trending Now"
            subtitle="Best-selling picks this week"
            href="/trending"
            viewLabel="Explore"
            altBg
          >
            {renderProductCarousel(trendingProducts, "prev-trending", "next-trending", "pag-trending")}
          </SectionBlock>
        );
      case "Categories":
        return <HomeCategorySection key="Categories" categories={displayCategories} />;
      case "Reviews":
        return (
          <HomeReviewsSection
            key="Reviews"
            reviews={rasaHomepage?.customerReviews || []}
            section={rasaHomepage?.reviewsSection || {}}
            enabled={rasaHomepage?.reviewsSection?.enabled !== false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#050505]">
        {reorderedSectionOrder.map((section) => renderSection(section))}
      </div>
    </Layout>
  );
};

export const getStaticProps = async () => {
  const [dataResult, attributesResult, brandsResult] = await Promise.allSettled([
    ProductServices.getShowingStoreProducts({}),
    AttributeServices.getShowingAttributes(),
    BrandServices.getShowingBrands(),
  ]);

  const data = dataResult.status === "fulfilled" ? dataResult.value : null;
  const attributes = attributesResult.status === "fulfilled" ? attributesResult.value : [];
  const brands = brandsResult.status === "fulfilled" ? brandsResult.value : [];
  const rasaHomepage = data?.rasaHomepage || null;

  return {
    props: {
      attributes: attributes || [],
      popularProducts: data?.popularProducts || [],
      discountProducts: data?.discountedProducts || [],
      bestSellingProducts: data?.bestSellingProducts || [],
      brands: brands || [],
      rasaHomepage,
    },
    revalidate: 30,
  };
};

export default Home;
