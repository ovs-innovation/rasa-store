import { useContext, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { IoClose, IoChevronDown, IoChevronForward } from "react-icons/io5";
import {
  FiHome,
  FiGrid,
  FiHeart,
  FiShuffle,
  FiUsers,
  FiPhoneCall,
  FiFileText,
  FiShield,
  FiBriefcase,
  FiTruck,
} from "react-icons/fi";

//internal import
import useShopCategories from "@hooks/useShopCategories";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { getCategoryNavUrl } from "@utils/shopCategories";
import { SidebarContext } from "@context/SidebarContext";

const Category = () => {
  const router = useRouter();
  const { categoryDrawerOpen, closeCategoryDrawer } = useContext(SidebarContext);
  const { navItems } = useShopCategories();
  const { showingTranslateValue } = useUtilsFunction();
  const [activeTab, setActiveTab] = useState("category");
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);

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
            onClick={() => {
              setActiveTab("category");
              setExpandedCategoryId(null);
            }}
            className={`flex-1 py-4 text-center font-bold text-xs uppercase tracking-widest transition-colors duration-300 ${
              activeTab === "category"
                ? `text-[#D4AF37] border-b-2 border-[#D4AF37]`
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Category
          </button>
          <button
            onClick={() => {
              setActiveTab("pages");
              setExpandedCategoryId(null);
            }}
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
          <div className="relative grid grid-cols-1 gap-1 p-4 pt-3">
            {navItems.map((cat) => {
              const hasChildren = cat.children?.length > 0;
              const isExpanded = expandedCategoryId === cat._id;
              const categoryName = showingTranslateValue(cat.name) || cat.slug;

              return (
                <div key={cat._id} className="border-b border-neutral-900/30">
                  <button
                    type="button"
                    onClick={() => {
                      if (hasChildren) {
                        setExpandedCategoryId(isExpanded ? null : cat._id);
                        return;
                      }
                      closeCategoryDrawer();
                      router.push(getCategoryNavUrl(cat));
                    }}
                    className="flex w-full items-center gap-3 px-3 py-3 text-xs font-black uppercase tracking-widest text-neutral-200 hover:bg-neutral-900 hover:text-[#D4AF37] transition-colors"
                  >
                    <img
                      src={cat.icon}
                      alt={categoryName}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-md object-cover flex-shrink-0 border border-neutral-800"
                    />
                    <span className="flex-1 text-left">{categoryName}</span>
                    {hasChildren ? (
                      <span className="text-neutral-500">
                        {isExpanded ? (
                          <IoChevronDown className="text-sm" />
                        ) : (
                          <IoChevronForward className="text-sm" />
                        )}
                      </span>
                    ) : null}
                  </button>

                  {hasChildren && isExpanded && (
                    <div className="pb-3 pl-14 pr-3">
                      <Link
                        href={getCategoryNavUrl(cat)}
                        onClick={closeCategoryDrawer}
                        className="block py-2 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] hover:text-white transition-colors"
                      >
                        View All {categoryName}
                      </Link>
                      {cat.children.map((sub) => (
                        <Link
                          key={sub._id}
                          href={getCategoryNavUrl(sub)}
                          onClick={closeCategoryDrawer}
                          className="block py-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-[#D4AF37] transition-colors"
                        >
                          {showingTranslateValue(sub.name)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
