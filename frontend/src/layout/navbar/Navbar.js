import { useContext, useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCart } from "react-use-cart";
import { IoSearchOutline } from "react-icons/io5";
import { FiShoppingCart, FiHeart } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";

import { getUserSession } from "@lib/auth";
import useWishlist from "@hooks/useWishlist";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import CartDrawer from "@components/drawer/CartDrawer";
import { SidebarContext } from "@context/SidebarContext";
import CategoryServices from "@services/CategoryServices";
import SearchSuggestions from "@components/search/SearchSuggestions";
import LowerCategoryNavbar from "./LowerCategoryNavbar";
import CustomerNotificationBell from "@components/notification/CustomerNotificationBell";
import { pickBrandLogo } from "@utils/brandAssets";

const NavbarLogo = () => {
  return (
    <Link href="/" className="flex items-center shrink-0 relative ml-6 w-44 h-16" aria-label="The Rasa Store">
      <img
        src="/rasaLogo.png"
        alt="The Rasa Store"
        className="absolute top-[65%] -translate-y-1/2 left-0 h-36 w-auto max-w-none object-contain select-none z-10"
        draggable="false"
      />
    </Link>
  );
};

const Navbar = () => {
  const { showingTranslateValue } = useUtilsFunction();
  const router = useRouter();
  const { data: categoriesData } = useQuery({
    queryKey: ["category"],
    queryFn: async () => await CategoryServices.getShowingCategory(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const getLevel1Categories = (categories) => {
    if (!categories || !Array.isArray(categories) || categories.length === 0) return [];

    const homeRoot = categories.find(
      (cat) =>
        cat.id === "Root" ||
        showingTranslateValue(cat?.name)?.toLowerCase() === "home"
    );

    let topLevel = homeRoot?.children?.length ? homeRoot.children : categories;
    const finalCategories = [];
    topLevel.forEach((cat) => {
      finalCategories.push(cat);
    });
    return finalCategories;
  };

  const NAVBAR_ALLOWED = ["footwear", "bags"];
  const allCategories = getLevel1Categories(categoriesData);
  // Only show top-level categories whose slug exactly matches footwear or bags
  const categories = allCategories.filter((cat) => {
    const slug = (cat?.slug || "").toLowerCase();
    const name = (showingTranslateValue ? showingTranslateValue(cat?.name) : (cat?.name?.en || cat?.name || "")).toLowerCase();
    return NAVBAR_ALLOWED.some((allowed) => slug === allowed || name === allowed || slug.startsWith(allowed) && !slug.includes("-"));
  }).slice(0, 2);

  const { toggleCartDrawer } = useContext(SidebarContext);
  const { totalUniqueItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const userInfo = getUserSession();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize from route to avoid "flash" on first paint.
  const initialShowSearch =
    router.pathname !== "/" || router.pathname === "/search";
  const [showSearchInNavbar, setShowSearchInNavbar] = useState(initialShowSearch);
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);

  const isHome = router.pathname === "/";
  const showNavbarSearch =
    !isHome || showSearchInNavbar || router.pathname === "/search";

  useEffect(() => {
    if (!isHome) {
      setShowSearchInNavbar(true);
      return;
    }

    // On the homepage the navbar keeps its initial state (category menu) for the
    // entire pinned hero experience, and only swaps to the search bar once the
    // full hero section has been scrolled past.
    const onScroll = () => {
      const heroEl = document.getElementById("hero-section");
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        setShowSearchInNavbar(rect.bottom <= 100);
      } else {
        setShowSearchInNavbar(false);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome, router.asPath]);

  useEffect(() => {
    if (router.pathname === "/search" && router.query.query) {
      setSearchText(router.query.query);
    }
  }, [router.pathname, router.query.query]);

  const handleSearchChange = (value) => {
    setSearchText(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchText.trim();
    setShowSuggestions(false);
    searchInputRef.current?.blur();
    if (trimmed) {
      router
        .push(
          { pathname: "/search", query: { query: trimmed } },
          `/search?query=${encodeURIComponent(trimmed)}`,
          { shallow: false }
        )
        .then(() => setSearchText(""))
        .catch(() => {
          window.location.href = `/search?query=${encodeURIComponent(trimmed)}`;
        });
    }
  };

  return (
    <>
      <CartDrawer />
      <header className="hidden lg:block bg-[#050505] text-white border-b border-neutral-900">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">
          <div
            className={`flex items-center gap-4 transition-all duration-300 ${
              showNavbarSearch ? "py-2.5" : "py-2"
            }`}
          >
            <NavbarLogo />

            <div className="flex-1 min-w-0 flex items-center justify-center gap-2">
              {showNavbarSearch ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="navbar-search-form flex items-center w-full max-w-3xl rounded-none border border-neutral-800 bg-[#0F0F0F] p-0.5 hover:border-neutral-700 focus-within:border-neutral-700 focus-within:ring-0 focus-within:ring-offset-0 transition-all"
                >
                  <div className="flex-1 relative min-w-0 flex items-center min-h-[42px]">
                    <IoSearchOutline className="absolute left-3 text-neutral-400 text-lg pointer-events-none z-10" />
                    <input
                      ref={searchInputRef}
                      type="search"
                      placeholder="Search for streetwear, footwear, accessories..."
                      className="navbar-search-input w-full h-full py-2 pl-10 pr-2 text-xs font-black uppercase tracking-wider !bg-transparent !border-0 !border-none !shadow-none !ring-0 !outline-none focus:!ring-0 focus:!border-0 focus:!outline-none placeholder-neutral-500 text-white"
                      value={searchText}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => searchText.length > 0 && setShowSuggestions(true)}
                      onBlur={(e) => {
                        const relatedTarget = e.relatedTarget;
                        const box = document.querySelector(".search-suggestions-container");
                        if (!relatedTarget || (box && !box.contains(relatedTarget))) {
                          setTimeout(() => {
                            const active = document.activeElement;
                            if (!box || !box.contains(active)) setShowSuggestions(false);
                          }, 200);
                        }
                      }}
                    />
                    <SearchSuggestions
                      searchText={searchText}
                      showSuggestions={showSuggestions}
                      onSelect={() => {
                        setSearchText("");
                        setShowSuggestions(false);
                      }}
                      onClose={() => setShowSuggestions(false)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="shrink-0 rounded-none bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-widest px-8 py-3.5 border-0 outline-none shadow-none transition-colors duration-200"
                  >
                    Search
                  </button>
                </form>
              ) : isHome ? (
                <LowerCategoryNavbar
                  variant="inline"
                  categories={categories}
                  showingTranslateValue={showingTranslateValue}
                />
              ) : null}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <CustomerNotificationBell />
              <Link
                href="/wishlist"
                className="relative p-2.5 text-neutral-300 hover:text-white rounded-none hover:bg-neutral-900/50 transition-colors"
                aria-label="Wishlist"
              >
                <FiHeart className="text-xl" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 text-[8px] font-black text-black bg-[#D4AF37] rounded-none border border-black flex items-center justify-center px-1">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={toggleCartDrawer}
                className="relative p-2.5 text-neutral-300 hover:text-white rounded-none hover:bg-neutral-900/50 transition-colors"
                aria-label="Cart"
              >
                <FiShoppingCart className="text-xl" />
                {totalUniqueItems > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 text-[8px] font-black text-black bg-[#D4AF37] rounded-none border border-black flex items-center justify-center px-1">
                    {totalUniqueItems}
                  </span>
                )}
              </button>
              <div className="w-px h-8 bg-neutral-900 mx-1" />
              {mounted && userInfo?.image ? (
                <Link href="/user/dashboard">
                  <img
                    width={36}
                    height={36}
                    src={userInfo.image}
                    alt="Account"
                    className="rounded-none w-9 h-9 border border-black object-cover"
                  />
                </Link>
              ) : mounted && userInfo?.name ? (
                <Link
                  href="/user/dashboard"
                  className="flex h-9 w-9 items-center justify-center rounded-none border border-black bg-black text-white hover:bg-white hover:text-black transition-colors font-black text-sm"
                >
                  {userInfo.name[0].toUpperCase()}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push("/auth/login")}
                  className="text-xs font-black uppercase tracking-widest text-black bg-[#D4AF37] hover:bg-[#b8952f] px-6 py-3.5 rounded-md transition-all duration-200"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>

        {showNavbarSearch && (
          <LowerCategoryNavbar
            variant="row"
            categories={categories}
            showingTranslateValue={showingTranslateValue}
          />
        )}
      </header>
      <style jsx global>{`
        .navbar-search-form .navbar-search-input {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
          --tw-ring-shadow: 0 0 #0000 !important;
        }
        .navbar-search-form .navbar-search-input:focus {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
        }
      `}</style>
    </>
  );
};

export default Navbar;
