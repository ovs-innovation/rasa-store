import React, { useContext, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "react-use-cart";
import { FiHome, FiShoppingCart, FiHeart, FiFileText, FiSearch, FiBell } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import useCustomerAuth from "@hooks/useCustomerAuth";
import CustomerNotificationServices from "@services/CustomerNotificationServices";
import { SidebarContext } from "@context/SidebarContext";
import useWishlist from "@hooks/useWishlist";
import useGetSetting from "@hooks/useGetSetting";

const MobileBottomNavigation = () => {
  const router = useRouter();
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { toggleCartDrawer, toggleSearch, showSearch } = useContext(SidebarContext);
  const { storeCustomizationSetting } = useGetSetting();
  const { isLoggedIn, userId } = useCustomerAuth();

  const { data: notifData } = useQuery({
    queryKey: ["customerNotifications", userId, "badge"],
    queryFn: () => CustomerNotificationServices.getUnreadCount(),
    enabled: isLoggedIn,
    refetchInterval: 60000,
  });

  const unreadCount = notifData?.unreadCount || 0;

  const isActive = (href) => router.pathname === href;

  return (
    <div className="lg:hidden fixed bottom-0 w-full bg-white z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-100">
      <div className="flex justify-between items-center px-4 py-2 pt-3">
        {/* Home */}
        <Link href="/" className={`flex flex-col items-center justify-center w-full ${isActive("/") ? "text-store-500" : "text-gray-500"}`}>
          <FiHome className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* Notifications */}
        <Link
          href={isLoggedIn ? "/user/notifications" : "/auth/login"}
          className={`flex flex-col items-center justify-center w-full relative ${isActive("/user/notifications") ? "text-store-500" : "text-gray-500"}`}
        >
          <div className="relative">
            <FiBell className="w-6 h-6 mb-1" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-0.5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Alerts</span>
        </Link>

        {/* My Orders */}
        <Link href="/user/my-orders" className={`flex flex-col items-center justify-center w-full ${isActive("/user/my-orders") ? "text-store-500" : "text-gray-500"}`}>
          <FiFileText className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Orders</span>
        </Link>

        {/* Cart */}
        <button 
          onClick={toggleCartDrawer} 
          className={`flex flex-col items-center justify-center w-full relative ${router.pathname === "/cart" ? "text-store-500" : "text-gray-500"}`}
        >
          <div className="relative">
            <FiShoppingCart className="w-6 h-6 mb-1" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-store-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </button>

        {/* Search */}
        <button 
          onClick={toggleSearch} 
          className={`flex flex-col items-center justify-center w-full ${showSearch ? "text-store-500" : "text-gray-500"}`}
        >
          <FiSearch className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Search</span>
        </button>

        {/* WishList */}
        <Link href="/wishlist" className={`flex flex-col items-center justify-center w-full ${isActive("/wishlist") ? "text-store-500" : "text-gray-500"}`}>
          <div className="relative">
            <FiHeart className="w-6 h-6 mb-1" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-store-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">WishList</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileBottomNavigation;
