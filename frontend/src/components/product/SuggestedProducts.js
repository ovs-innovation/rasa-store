import React, { useEffect, useState, useContext } from "react";
import Cookies from "js-cookie";
import { SidebarContext } from "@context/SidebarContext";
import ProductServices from "@services/ProductServices";
import ProductCard from "@components/product/ProductCard";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { FiChevronRight } from "react-icons/fi";
import SectionHeader from "@components/common/SectionHeader";

const SuggestedProducts = () => {
  const { showingTranslateValue } = useUtilsFunction();
  const { isLoading, setIsLoading } = useContext(SidebarContext);
  const [products, setProducts] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Responsive product count
  const getVisibleCount = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) return 6; // lg and up
      return 4; // sm and below
    }
    return 6;
  };
  const [visibleCount, setVisibleCount] = useState(getVisibleCount());

  useEffect(() => {
    // Update visibleCount on resize
    const handleResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchSuggestedProducts = async () => {
      try {
        setFetchLoading(true);
        let userInfo = null;
        try {
          const cookie = Cookies.get("userInfo");
          if (cookie) userInfo = JSON.parse(cookie);
        } catch (e) { }

        let params = {};
        let guestIds = [];
        // 2. If guest, get history from LocalStorage
        if (!userInfo) {
          const guestHistory = localStorage.getItem("recentlyViewed");
          if (guestHistory) {
            try {
              const parsed = JSON.parse(guestHistory);
              if (Array.isArray(parsed)) {
                // Remove duplicates and deleted products
                const unique = Array.from(new Set(parsed.map(item => item._id)));
                guestIds = unique;
                params.productIds = guestIds.join(",");
              }
            } catch (e) {
              console.error("Error parsing guest history", e);
            }
          }
        }
        // 3. Fetch from Backend
        const res = await ProductServices.getSuggestedProducts(params);
        // Filter out deleted/null products and duplicates
        const filtered = Array.isArray(res)
          ? res.filter((p, i, arr) => p && arr.findIndex(x => x._id === p._id) === i)
          : [];
        setProducts(filtered);
      } catch (err) {
        console.error("Error fetching suggested products:", err);
        setProducts([]);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchSuggestedProducts();
  }, []);

  if (fetchLoading) {
    return null; // Or a skeleton loader
  }

  if (products.length === 0) {
    // Edge case: new user, cleared cache, or all products deleted
    return null;
  }

  return (
    <div className="relative lg:py-16 py-10 overflow-hidden rounded-none border border-neutral-100 bg-[#FAF9F6]">
      {/* Dynamic Background Layer */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-100/10 rounded-none blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-neutral-100/40 rounded-none blur-[80px]" />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 px-4 sm:px-8">
        {/* Header Section with Badge */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black text-white text-[10px] font-extrabold uppercase tracking-widest shadow-sm mb-4 rounded-none">
            <span className="flex h-1.5 w-1.5 rounded-none bg-[#D4AF37] animate-pulse" />
            <span>Picked For You</span>
          </div>
          <SectionHeader
            title="Suggested For You"
            subtitle="Personalized recommendations based on your activity"
            align="left"
          />
        </div>

        {/* Responsive Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8">
          {(showAll ? products : products.slice(0, visibleCount)).map((product) => (
            <div key={product._id} className="transition-all duration-500 hover:-translate-y-1">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Enhanced "View All" Button */}
        {products.length > visibleCount && !showAll && (
          <div className="flex justify-center mt-12">
            <button
              className="group relative px-8 py-3.5 bg-black text-white font-extrabold flex items-center gap-3 transition-all duration-300 hover:bg-[#D4AF37] hover:text-black rounded-none uppercase text-xs tracking-widest border border-black"
              onClick={() => setShowAll(true)}
            >
              <span className="relative z-10">View All Suggestions</span>
              <FiChevronRight className="text-lg group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestedProducts;
