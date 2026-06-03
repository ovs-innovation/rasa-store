import React, { useContext, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
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
import { pickBrandLogo } from "@utils/brandAssets";
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
      <footer className="lg:hidden fixed z-[60] top-0 bg-white flex items-center justify-between w-full h-16 px-3 sm:px-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            aria-label="Bar"
            onClick={toggleCategoryDrawer}
            className="flex items-center justify-center flex-shrink-0 h-auto relative focus:outline-none"
          >
            <span className={`text-xl text-store-500`}>
              <FiAlignLeft className="w-6 h-6 drop-shadow-xl" />
            </span>
          </button>
          <Link
            href="/"
            className="flex items-center justify-center"
            rel="noreferrer"
            aria-label={t("Home") || "Home"}
          >
            <div className="relative w-[72px] h-[72px]">
              <Image
                src={pickBrandLogo(
                  storeCustomizationSetting?.navbar?.logo,
                  storeCustomizationSetting?.seo?.favicon
                )}
                alt="logo"
                fill
                className="object-contain"
                sizes="72px"
                priority
              />
            </div>
          </Link>
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-900 hover:bg-gray-100 hover:text-black shrink-0 ml-6"
            aria-label="Home"
            title="Home"
          >
            <FiHome className="w-5 h-5" />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <CustomerNotificationBell />
          <div className="flex items-center justify-center relative">
            {userInfo?.image ? (
              <Link href="/user/dashboard" className="relative top-1 w-8 h-8 block">
                <Image
                  width={32}
                  height={32}
                  src={userInfo.image}
                  alt="user"
                  className="rounded-full object-cover w-8 h-8 border-2 border-gray-200"
                />
              </Link>
            ) : userInfo?.name ? (
              <Link
                href="/user/dashboard"
                className={`leading-none font-bold font-serif block px-3 py-2 border rounded-full border-store-500 text-store-500`}
              >
                {userInfo?.name[0]}
              </Link>
            ) : (
              <div className="relative">
                <Link
                  href="/auth/login"
                  className="bg-store-500 text-white px-4 py-2 rounded-full flex items-center gap-2 font-bold text-sm hover:bg-store-600 transition-colors"
                >
                  <IoLockClosedOutline className="text-lg" /> Login
                </Link>
              </div>
            )}
          </div>

        </div>
      </footer>
      {showSearch && (
        <div className="fixed z-50 top-16 left-0 w-full bg-white px-3 py-2 shadow" style={{ overflow: 'visible' }}>
          <form
            onSubmit={handleSubmit}
            className="relative bg-white shadow-sm rounded-md w-full flex items-center overflow-visible"
          >
            {/* Location Button */}
            <LocationButton className="h-10 flex-shrink-0" />

            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                ref={searchInputRef}
                onChange={(e) => handleSearchChange(e.target.value)}
                value={searchText}
                type="text"
                placeholder="Search for medicine or store..."
                className="w-full pl-3 pr-12 appearance-none transition ease-in-out text-input text-sm font-sans rounded-md min-h-10 h-10 duration-200 bg-[#F3F4F6] focus:ring-2 focus:ring-store-500 outline-none border-none focus:outline-none placeholder-gray-500 placeholder-opacity-75"
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
                className={`outline-none text-xl text-gray-400 absolute top-0 right-0 end-0 w-12 h-full flex items-center justify-center transition duration-200 ease-in-out hover:text-heading focus:outline-none text-store-500 z-10`}>
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

export default dynamic(() => Promise.resolve(MobileFooter), { ssr: false });

