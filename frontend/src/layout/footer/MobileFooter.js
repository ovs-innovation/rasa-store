import React, { useContext, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "react-use-cart";
import { FiHome, FiUser, FiShoppingCart, FiAlignLeft, FiHeart } from "react-icons/fi";
import { IoSearchOutline, IoLockClosedOutline } from "react-icons/io5";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

//internal imports
import { SidebarContext } from "@context/SidebarContext";
import { UserContext } from "@context/UserContext";
import CategoryDrawer from "@components/drawer/CategoryDrawer";
import useGetSetting from "@hooks/useGetSetting";
import useWishlist from "@hooks/useWishlist";
import SearchSuggestions from "@components/search/SearchSuggestions";
import { pickBrandLogo } from "@utils/brandAssets";
const MobileFooter = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSignDropdown, setShowSignDropdown] = useState(false);
  const searchInputRef = useRef(null);
  const { toggleCategoryDrawer, showSearch, setShowSearch, toggleCartDrawer } = useContext(SidebarContext);
  const { state: userState } = useContext(UserContext);
  const { totalUniqueItems } = useCart();
  const userInfo = userState?.userInfo;
  const router = useRouter();
  const { t } = useTranslation("common");
  const { storeCustomizationSetting, globalSetting } = useGetSetting();
  const storeColor = storeCustomizationSetting?.theme?.color || "green";
  const brandLogo = pickBrandLogo(
    storeCustomizationSetting?.seo?.favicon,
    globalSetting?.logo,
    storeCustomizationSetting?.navbar?.logo
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleSearchChange = (value) => {
    setSearchText(value);
    setShowSuggestions(value.trim().length > 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const trimmedSearchText = searchText.trim();
    setShowSuggestions(false);
    searchInputRef.current?.blur();

    if (trimmedSearchText) {
      router.push(
        {
          pathname: "/search",
          query: { query: trimmedSearchText },
        },
        `/search?query=${encodeURIComponent(trimmedSearchText)}`,
        { shallow: false }
      ).then(() => {
        setSearchText("");
        setShowSearch(false);
      }).catch((err) => {
        console.error("Navigation error:", err);
        window.location.href = `/search?query=${encodeURIComponent(trimmedSearchText)}`;
      });
    } else {
      router.push(`/`);
      setSearchText("");
      setShowSearch(false);
    }
  };

  const openSearch = () => {
    if (!showSearch) {
      setShowSearch(true);
      setTimeout(() => searchInputRef.current?.focus(), 120);
    } else {
      searchInputRef.current?.focus();
    }
  };

  return (
    <>
      {/* Drawer lives off-canvas; keep it mounted without forcing page layout/scroll */}
      <CategoryDrawer />
      <footer className="lg:hidden fixed z-[60] top-0 bg-[#050505]/95 backdrop-blur-md w-full h-16 px-2.5 sm:px-4 border-b border-neutral-900/60 shadow-md">
        <div className="flex h-full w-full items-center justify-between gap-1.5">
          {/* Left — menu + logo (logo always reserved) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              aria-label="Menu"
              onClick={toggleCategoryDrawer}
              className="flex items-center justify-center p-1.5 focus:outline-none"
            >
              <FiAlignLeft className="w-6 h-6 text-white hover:text-[#D4AF37] transition-colors" />
            </button>
            <Link
              href="/"
              className="flex h-10 w-10 shrink-0 items-center justify-center sm:h-11 sm:w-11"
              rel="noreferrer"
              aria-label={t("Home") || "Home"}
            >
              <img
                src={brandLogo}
                alt="The Rasa Store"
                width={44}
                height={44}
                className="h-10 w-10 object-contain select-none sm:h-11 sm:w-11"
                draggable={false}
              />
            </Link>
          </div>

          {/* Center — full search pill on wider phones, icon-only on narrow screens */}
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search products"
            className={`hidden min-[400px]:flex h-9 min-w-0 flex-1 max-w-[190px] items-center gap-2 rounded-full border px-3 text-left transition-all ${
              showSearch
                ? "border-[#D4AF37]/60 bg-[#111] text-white"
                : "border-neutral-800 bg-[#0d0d0d] text-neutral-500 hover:border-neutral-700"
            }`}
          >
            <IoSearchOutline className="shrink-0 text-base text-neutral-400" />
            <span className="truncate text-[11px] font-medium">Search sneakers, bags...</span>
          </button>
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search products"
            className="flex min-[400px]:hidden items-center justify-center p-1.5 text-neutral-400 hover:text-white transition-colors"
          >
            <IoSearchOutline className="w-5 h-5" />
          </button>

          {/* Right — cart + account */}
          <div className="flex items-center justify-end gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleCartDrawer}
              aria-label="Cart"
              className="relative p-1.5 text-neutral-300 hover:text-white transition-colors"
            >
              <FiShoppingCart className="w-6 h-6" />
              {totalUniqueItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 text-[8px] font-black text-black bg-[#D4AF37] rounded-full border border-black flex items-center justify-center px-1">
                  {totalUniqueItems}
                </span>
              )}
            </button>
            <div className="flex items-center justify-center relative">
              {mounted && userInfo?.image ? (
                <Link href="/user/dashboard" className="relative w-8 h-8 block">
                  <img
                    width={32}
                    height={32}
                    src={userInfo.image}
                    alt="user"
                    className="rounded-full object-cover w-8 h-8 border border-neutral-800"
                  />
                </Link>
              ) : mounted && userInfo?.name ? (
                <Link
                  href="/user/dashboard"
                  className="leading-none font-bold block px-2.5 py-1.5 border rounded-full border-[#D4AF37] text-[#D4AF37] text-xs"
                >
                  {userInfo?.name[0]}
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="bg-[#D4AF37] text-black w-8 h-8 rounded-full flex items-center justify-center font-extrabold hover:bg-[#c29e2e] transition-colors"
                  title="Login"
                >
                  <FiUser className="text-base" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </footer>
      {showSearch && (
        <div className="fixed z-50 top-16 left-0 w-full bg-[#050505]/95 backdrop-blur-md px-3 py-2.5 border-b border-neutral-900 shadow-xl" style={{ overflow: "visible" }}>
          <form
            onSubmit={handleSubmit}
            className="relative bg-[#0d0d0d] border border-neutral-800 rounded-full w-full flex items-center overflow-visible"
          >
            <div className="flex-1 relative flex items-center">
              <IoSearchOutline className="absolute left-3 text-neutral-500 text-lg pointer-events-none" />
              <input
                ref={searchInputRef}
                onChange={(e) => handleSearchChange(e.target.value)}
                value={searchText}
                type="search"
                placeholder="Search sneakers, bags, brands..."
                className="w-full pl-10 pr-10 appearance-none transition ease-in-out text-sm font-sans rounded-full min-h-10 h-10 duration-200 bg-transparent text-white focus:outline-none placeholder-neutral-500"
                onFocus={() => searchText.trim().length > 0 && setShowSuggestions(true)}
                onBlur={(e) => {
                  const relatedTarget = e.relatedTarget;
                  const suggestionsContainer = document.querySelector(".search-suggestions-container");

                  if (!relatedTarget || (suggestionsContainer && !suggestionsContainer.contains(relatedTarget))) {
                    setTimeout(() => {
                      const activeElement = document.activeElement;
                      if (!suggestionsContainer || !suggestionsContainer.contains(activeElement)) {
                        setShowSuggestions(false);
                      }
                    }, 200);
                  }
                }}
              />
              <button
                aria-label="Close search"
                type="button"
                onClick={() => {
                  setShowSearch(false);
                  setShowSuggestions(false);
                  setSearchText("");
                }}
                className="absolute right-2 text-neutral-500 hover:text-white text-lg px-1"
              >
                ×
              </button>
              <SearchSuggestions
                searchText={searchText}
                showSuggestions={showSuggestions}
                onSelect={() => {
                  setSearchText("");
                  setShowSuggestions(false);
                  setShowSearch(false);
                }}
                onClose={() => setShowSuggestions(false)}
              />
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default MobileFooter;

