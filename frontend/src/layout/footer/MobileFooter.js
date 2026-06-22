import React, { useContext, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "react-use-cart";
import { FiHome, FiUser, FiShoppingCart, FiAlignLeft, FiHeart } from "react-icons/fi";
import { IoSearchOutline, IoLockClosedOutline } from "react-icons/io5";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

//internal imports
import { getUserSession } from "@lib/auth";
import { SidebarContext } from "@context/SidebarContext";
import CategoryDrawer from "@components/drawer/CategoryDrawer";
import useGetSetting from "@hooks/useGetSetting";
import useWishlist from "@hooks/useWishlist";
import LocationButton from "@components/location/LocationButton";
import SearchSuggestions from "@components/search/SearchSuggestions";
import CustomerNotificationBell from "@components/notification/CustomerNotificationBell";
const MobileFooter = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSignDropdown, setShowSignDropdown] = useState(false);
  const searchInputRef = useRef(null);
  const { toggleCategoryDrawer, showSearch, setShowSearch } = useContext(SidebarContext);
  const userInfo = getUserSession();
  const router = useRouter();
  const { t } = useTranslation("common");
  const { storeCustomizationSetting } = useGetSetting();
  const storeColor = storeCustomizationSetting?.theme?.color || "green";

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

  return (
    <>
      {/* Drawer lives off-canvas; keep it mounted without forcing page layout/scroll */}
      <CategoryDrawer />
      <footer className="lg:hidden fixed z-[60] top-0 bg-[#050505]/95 backdrop-blur-md flex items-center justify-between w-full h-16 px-3 sm:px-10 border-b border-neutral-900/60 shadow-md">
        <div className="flex items-center gap-3">
          <button
            aria-label="Bar"
            onClick={toggleCategoryDrawer}
            className="flex items-center justify-center flex-shrink-0 h-auto relative focus:outline-none"
          >
            <span className="text-white hover:text-[#D4AF37] transition-colors duration-200">
              <FiAlignLeft className="w-6 h-6" />
            </span>
          </button>
          <Link
            href="/"
            className="flex items-center justify-center"
            rel="noreferrer"
            aria-label={t("Home") || "Home"}
          >
            <div className="relative w-[56px] h-[56px]">
              <Image
                src="/rasaLogo.png"
                alt="The Rasa Store"
                fill
                className="object-contain"
                sizes="56px"
                priority
              />
            </div>
          </Link>

        </div>
        <div className="flex items-center gap-3">
          <CustomerNotificationBell />
          <div className="flex items-center justify-center relative">
            {mounted && userInfo?.image ? (
              <Link href="/user/dashboard" className="relative top-0.5 w-8 h-8 block">
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
                className="leading-none font-bold block px-3 py-2 border rounded-full border-[#D4AF37] text-[#D4AF37]"
              >
                {userInfo?.name[0]}
              </Link>
            ) : (
              <div className="relative">
                <Link
                  href="/auth/login"
                  className="bg-[#D4AF37] text-black w-9 h-9 sm:w-auto sm:px-4 sm:py-2 rounded-full flex items-center justify-center gap-1.5 font-extrabold text-xs uppercase tracking-wider hover:bg-[#c29e2e] transition-colors"
                  title="Login"
                >
                  <FiUser className="text-base" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </footer>
      {showSearch && (
        <div className="fixed z-50 top-16 left-0 w-full bg-[#050505]/95 backdrop-blur-md px-3 py-2.5 border-b border-neutral-900 shadow-xl" style={{ overflow: 'visible' }}>
          <form
            onSubmit={handleSubmit}
            className="relative bg-[#0d0d0d] border border-neutral-800 rounded-md w-full flex items-center overflow-visible"
          >
            {/* Location Button */}
            <LocationButton className="h-10 flex-shrink-0 !bg-transparent text-neutral-300 hover:text-[#D4AF37]" />

            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                ref={searchInputRef}
                onChange={(e) => handleSearchChange(e.target.value)}
                value={searchText}
                type="text"
                placeholder="Search sneakers, bags, brands..."
                className="w-full pl-3 pr-12 appearance-none transition ease-in-out text-sm font-sans rounded-md min-h-10 h-10 duration-200 bg-transparent text-white focus:outline-none placeholder-neutral-500"
                onFocus={() => searchText.trim().length > 0 && setShowSuggestions(true)}
                onBlur={(e) => {
                  const relatedTarget = e.relatedTarget;
                  const suggestionsContainer = document.querySelector('.search-suggestions-container');

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
                aria-label="Search"
                type="submit"
                className="outline-none text-xl text-neutral-400 absolute top-0 right-0 end-0 w-12 h-full flex items-center justify-center transition duration-200 ease-in-out hover:text-[#D4AF37] focus:outline-none z-10">
                <IoSearchOutline />
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

