import { useContext, useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCart } from "react-use-cart";
import { IoSearchOutline } from "react-icons/io5";
import { FiShoppingCart, FiHeart } from "react-icons/fi";

import useWishlist from "@hooks/useWishlist";
import useGetSetting from "@hooks/useGetSetting";
import useShopCategories from "@hooks/useShopCategories";
import useUtilsFunction from "@hooks/useUtilsFunction";
import CartDrawer from "@components/drawer/CartDrawer";
import { SidebarContext } from "@context/SidebarContext";
import { UserContext } from "@context/UserContext";
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
  const { navItems: categories } = useShopCategories();

  const { toggleCartDrawer } = useContext(SidebarContext);
  const { state: userState } = useContext(UserContext);
  const { totalUniqueItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [mounted, setMounted] = useState(false);
  const userInfo = mounted ? userState?.userInfo : null;
  useEffect(() => {
    setMounted(true);
  }, []);

  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);

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

  const isHome = router.pathname === "/";

  return (
    <>
      <CartDrawer />
      <header className="hidden lg:block bg-[#050505] text-white border-b border-neutral-900">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-3 py-2">
            <NavbarLogo />

            <div className="flex min-w-0 flex-1 items-center justify-center">
              <form
                onSubmit={handleSearchSubmit}
                className="navbar-search-form flex w-full max-w-xl items-center rounded-full border border-neutral-800 bg-[#0F0F0F] px-1 py-0.5 transition-colors hover:border-neutral-700 focus-within:border-neutral-700"
              >
                <div className="relative flex min-h-[36px] min-w-0 flex-1 items-center">
                  <IoSearchOutline className="pointer-events-none absolute left-3 z-10 text-base text-neutral-500" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Search sneakers, bags, streetwear..."
                    className="navbar-search-input h-full w-full rounded-full py-2 pl-9 pr-2 text-xs font-medium normal-case tracking-normal !border-0 !bg-transparent !shadow-none !outline-none placeholder-neutral-500 text-white focus:!border-0 focus:!ring-0"
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
                  className="shrink-0 rounded-full bg-[#D4AF37] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-black transition-colors hover:bg-[#c9a432]"
                >
                  Search
                </button>
              </form>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <CustomerNotificationBell />
              <Link
                href="/wishlist"
                className="relative p-2.5 text-neutral-300 hover:text-white rounded-none hover:bg-neutral-900/50 transition-colors"
                aria-label="Wishlist"
              >
                <FiHeart className="text-xl" />
                {mounted && wishlistCount > 0 && (
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
                {mounted && totalUniqueItems > 0 && (
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
                  className="rounded-md bg-[#D4AF37] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-black transition-colors hover:bg-[#c9a432]"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>

        {!isHome && (
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
