import { useContext, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { IoClose, IoChevronDown, IoChevronForward } from "react-icons/io5";
import {
  FiHome,
  FiGrid,
  FiShoppingBag,
  FiTag,
  FiHeart,
  FiShuffle,
  FiUsers,
  FiPhoneCall,
  FiHelpCircle,
  FiFileText,
  FiShield,
  FiBriefcase,
  FiRefreshCw,
  FiTruck,
} from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";

//internal import
import useGetSetting from "@hooks/useGetSetting";
import Loading from "@components/preloader/Loading";
import { SidebarContext } from "@context/SidebarContext";
import CategoryServices from "@services/CategoryServices";
import CategoryCard from "@components/category/CategoryCard";
import useUtilsFunction from "@hooks/useUtilsFunction";

const Category = () => {
  const router = useRouter();
  const { categoryDrawerOpen, closeCategoryDrawer } = 
    useContext(SidebarContext);
  const { showingTranslateValue } = useUtilsFunction();
  const { storeCustomizationSetting } = useGetSetting();
  const storeColor = storeCustomizationSetting?.theme?.color || "green";

  const [activeTab, setActiveTab] = useState("category");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { data: flatCategories, error, isLoading } = useQuery({
    queryKey: ["category"],
    queryFn: async () => await CategoryServices.getShowingCategory(),
  });

  const level1Categories = (() => {
    if (!flatCategories?.length) return [];
    const homeRoot = flatCategories.find(
      (cat) =>
        cat.id === "Root" ||
        showingTranslateValue(cat?.name)?.toLowerCase() === "home"
    );
    if (homeRoot?.children?.length) return homeRoot.children;
    return flatCategories.filter(
      (cat) => cat.parentId === "0" || cat.parentId === "Root" || !cat.parentId
    );
  })();

  const mainLinks = [
    { title: "Home", href: "/", icon: FiHome },
    // { title: "Category", href: "/search", icon: FiGrid },
    // { title: "Products", href: "/search", icon: FiShoppingBag },
    // { title: "Top Offers", href: "/offer", icon: FiTag },
    { title: "My Orders", href: "/user/my-orders", icon: FiGrid },
    { title: "Favorite", href: "/wishlist", icon: FiHeart },
    { title: "Compare", href: "/compare", icon: FiShuffle },
    { title: "About Us", href: "/about-us", icon: FiUsers },
    { title: "Careers", href: "/careers", icon: FiBriefcase },
    { title: "Contact Us", href: "/contact-us", icon: FiPhoneCall },
    // { title: "FAQs", href: "/faq", icon: FiHelpCircle },
    { title: "Refund and Returns Policy", href: "/refund-and-return-policy", icon: FiRefreshCw },
    { title: "Shipping & Delivery Policy", href: "/shipping-and-delivery-policy", icon: FiTruck },
    { title: "Terms & Conditions", href: "/terms-and-conditions", icon: FiFileText },
    { title: "Privacy Policy", href: "/privacy-policy", icon: FiShield },
  ];

  return (
    <div className="flex flex-col w-full h-full bg-[#050505] text-white cursor-pointer scrollbar-hide border-r border-neutral-900/40">
      {categoryDrawerOpen && (
        <div className="w-full flex justify-between items-center h-16 px-6 py-4 bg-[#050505] border-b border-neutral-900/60">
          <h2 className="font-semibold text-lg m-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                width={56}
                height={56}
                src="/rasaLogo.png"
                alt="logo"
                className="object-contain"
              />
            </Link>
          </h2>
          <button
            onClick={closeCategoryDrawer}
            className="flex text-xl items-center justify-center w-8 h-8 rounded-full bg-neutral-900 text-neutral-400 hover:text-[#D4AF37] p-2 focus:outline-none transition-all duration-200"
            aria-label="close"
          >
            <IoClose />
          </button>
        </div>
      )}
      <div className="w-full max-h-full overflow-y-auto">
        {/* Tabs */}
        <div className="flex border-b border-neutral-900 bg-[#0A0A0A]">
          <button
            onClick={() => setActiveTab("category")}
            className={`flex-1 py-4 text-center font-bold text-xs uppercase tracking-widest transition-colors duration-300 ${
              activeTab === "category"
                ? `text-[#D4AF37] border-b-2 border-[#D4AF37]`
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Category
          </button>
          <button
            onClick={() => setActiveTab("pages")}
            className={`flex-1 py-4 text-center font-bold text-xs uppercase tracking-widest transition-colors duration-300 ${
              activeTab === "pages"
                ? `text-[#D4AF37] border-b-2 border-[#D4AF37]`
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Pages
          </button>
        </div>

        {activeTab === "pages" ? (
          <nav className="px-6 py-3">
            <ul className="space-y-1">
              {mainLinks.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    onClick={closeCategoryDrawer}
                    className="flex items-center rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:bg-neutral-900 hover:text-[#D4AF37] transition-all duration-150"
                  >
                    <item.icon className="flex-shrink-0 h-4 w-4 mr-3" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <>
            {isLoading ? (
              <Loading loading={isLoading} />
            ) : error ? (
              <p className="flex justify-center align-middle items-center m-auto text-xl text-red-500">
                {error?.response?.data?.message || error?.message}
              </p>
            ) : (
              <div className="relative grid grid-cols-1 gap-2 p-4 pt-3">
                {level1Categories?.map((subcategory1) => (
                  <div key={subcategory1._id}>
                    <div
                      className="flex items-center gap-3 px-3 py-3 text-xs font-black uppercase tracking-widest text-neutral-200 hover:bg-neutral-900 hover:text-[#D4AF37] border-b border-neutral-900/30 transition-colors cursor-pointer"
                      onClick={() => {
                        if (subcategory1?.children?.length > 0) {
                          toggleCategoryExpansion(subcategory1._id);
                          return;
                        }
                        const slug =
                          subcategory1.slug ||
                          (subcategory1?.name?.en || subcategory1?.name || "")
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/gi, "-");
                        router.push(`/search?category=${slug}&_id=${subcategory1._id}`);
                        closeCategoryDrawer();
                      }}
                    >
                      {subcategory1?.icon ? (
                        <Image
                          src={subcategory1.icon}
                          alt={showingTranslateValue(subcategory1?.name)}
                          width={20}
                          height={20}
                          className="object-contain flex-shrink-0"
                        />
                      ) : (
                        <div className="w-5 h-5 flex-shrink-0" />
                      )}
                      <span>{showingTranslateValue(subcategory1?.name)}</span>
                      {subcategory1?.children?.length > 0 && (
                        <div className="ml-auto">
                          {expandedCategories[subcategory1._id] ? (
                            <IoChevronDown className="text-gray-400 transition-transform duration-200" />
                          ) : (
                            <IoChevronForward className="text-gray-400 transition-transform duration-200" />
                          )}
                        </div>
                      )}
                    </div>

                    {subcategory1?.children?.length > 0 && expandedCategories[subcategory1._id] && (
                      <div className="bg-[#0A0A0A] rounded-md overflow-hidden my-1">
                        {subcategory1.children.map((subcategory2) => (
                          <div
                            key={subcategory2._id}
                            onClick={() => {
                              const slug =
                                subcategory2.slug ||
                                (subcategory2?.name?.en || subcategory2?.name || "")
                                  .toLowerCase()
                                  .replace(/[^a-z0-9]+/gi, "-");
                              router.push(`/search?category=${slug}&_id=${subcategory2._id}`);
                              closeCategoryDrawer();
                            }}
                            className="flex items-center gap-3 px-6 py-2.5 text-xs text-neutral-400 hover:bg-neutral-900/60 hover:text-[#D4AF37] transition-colors cursor-pointer border-b border-neutral-900/20 last:border-b-0"
                          >
                            {subcategory2?.icon ? (
                              <Image
                                src={subcategory2.icon}
                                alt={showingTranslateValue(subcategory2?.name)}
                                width={16}
                                height={16}
                                className="object-contain flex-shrink-0"
                              />
                            ) : (
                              <div className="w-4 h-4 flex-shrink-0" />
                            )}
                            <span>{showingTranslateValue(subcategory2?.name)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Category;
