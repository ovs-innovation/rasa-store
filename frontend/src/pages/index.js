import Layout from "@layout/Layout";
import ProductServices from "@services/ProductServices";
import HeroBanner from "@components/banner/HeroBanner";
import AttributeServices from "@services/AttributeServices";
import BrandServices from "@services/BrandServices";
import SectionHeader from "@components/common/SectionHeader";
import ShopByBrandSection from "@components/brand/ShopByBrandSection";
import HomeReviewsSection from "@components/reviews/HomeReviewsSection";
import HomeCategorySection from "@components/category/HomeCategorySection";
import HomeProductCarousel from "@components/product/HomeProductCarousel";
import HomeSection, { HomeEyebrow, HomeTitle, HomeViewAll } from "@components/common/HomeSection";
import { normalizeShopCategories } from "@utils/shopCategories";

const SectionBlock = ({ eyebrow, title, subtitle, href, viewLabel, children, altBg = false }) => (
  <HomeSection className={altBg ? "bg-[#0A0A0A]" : "bg-[#050505]"}>
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 md:mb-8">
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

  const displayCategories = normalizeShopCategories(rasaHomepage?.categoryBanners);

  const renderProductCarousel = (products, prevClass, nextClass, paginationClass) => (
    <HomeProductCarousel
      products={products}
      attributes={attributes}
      prevClass={prevClass}
      nextClass={nextClass}
      paginationClass={paginationClass}
    />
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
        return rasaHomepage?.heroSectionEnabled !== false ? (
          <HeroBanner key="Hero" cmsSlides={rasaHomepage?.heroSlides || []} />
        ) : null;
      case "Brands":
        return (
          <ShopByBrandSection
            key="Brands"
            brands={brands}
            enabled={rasaHomepage?.brandsSectionEnabled !== false}
          />
        );
      case "New Arrival":
        return (
          rasaHomepage?.newArrivalsSectionEnabled !== false &&
          newArrivals.length > 0 && (
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
          )
        );
      case "Trending":
        return (
          rasaHomepage?.trendingSectionEnabled !== false &&
          trendingProducts.length > 0 && (
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
          )
        );
      case "Categories":
        return (
          <HomeCategorySection
            key="Categories"
            categories={displayCategories}
            enabled={rasaHomepage?.categoriesSectionEnabled !== false}
          />
        );
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
    BrandServices.getShowingBrands(true),
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
