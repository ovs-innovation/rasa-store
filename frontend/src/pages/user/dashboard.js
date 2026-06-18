import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { IoLockOpenOutline } from "react-icons/io5";
import {
  FiBell,
  FiCheck,
  FiGrid,
  FiList,
  FiRefreshCw,
  FiSettings,
  FiShoppingCart,
  FiTruck,
  FiUser,
  FiMapPin,
  FiHeart,
  FiChevronRight,
  FiShoppingBag,
} from "react-icons/fi";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

import Layout from "@layout/Layout";
import Card from "@components/order-card/Card";
import OrderServices from "@services/OrderServices";
import RecentOrder from "@pages/user/recent-order";
import CustomerServices from "@services/CustomerServices";
import { SidebarContext } from "@context/SidebarContext";
import { UserContext } from "@context/UserContext";
import Loading from "@components/preloader/Loading";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { setToken } from "@services/httpServices";

const Dashboard = ({ title, description, children }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { state: userState, dispatch } = useContext(UserContext);
  const { isLoading, setIsLoading, currentPage } = useContext(SidebarContext);

  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const [isOpen, setIsOpen] = useState(false);

  const userInfo = userState?.userInfo || session?.user;
  const userId = userInfo?._id || userInfo?.id;
  const isAuthenticated = !!userInfo?.token || status === "authenticated";

  const {
    data,
    error,
    isLoading: loading,
  } = useQuery({
    queryKey: ["orders", { currentPage, user: userId }],
    queryFn: async () =>
      await OrderServices.getOrderCustomer({
        page: currentPage,
        limit: 10,
      }),
    enabled: isAuthenticated,
  });

  const { data: shippingAddressesResponse } = useQuery({
    queryKey: ["shippingAddress", { id: userId }],
    queryFn: async () =>
      await CustomerServices.getShippingAddress({
        userId: userId,
      }),
    enabled: !!userId && isAuthenticated,
  });

  const shippingAddresses = Array.isArray(shippingAddressesResponse?.shippingAddress)
    ? shippingAddressesResponse.shippingAddress
    : shippingAddressesResponse?.shippingAddress
      ? [shippingAddressesResponse.shippingAddress]
      : [];

  const defaultAddress = shippingAddresses.find(addr => addr.isDefault) || shippingAddresses[0] || null;

  const handleLogOut = () => {
    signOut({ redirect: false });
    Cookies.remove("userInfo");
    Cookies.remove("couponInfo");
    setToken(null);
    dispatch({ type: "USER_LOGOUT" });
    router.push("/");
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const userSidebar = [
    {
      title: showingTranslateValue(
        storeCustomizationSetting?.dashboard?.dashboard_title
      ),
      href: "/user/dashboard",
      icon: FiGrid,
    },

    {
      title: showingTranslateValue(
        storeCustomizationSetting?.dashboard?.my_order
      ),
      href: "/user/my-orders",
      icon: FiList,
    },
    {
      title: "Notifications",
      href: "/user/notifications",
      icon: FiBell,
    },
    {
      title: "My Account",
      href: "/user/my-account",
      icon: FiUser,
    },
    {
      title: "Track Order",
      href: "/user/track-order",
      icon: FiTruck,
    },

    {
      title: showingTranslateValue(
        storeCustomizationSetting?.dashboard?.update_profile
      ),
      href: "/user/update-profile",
      icon: FiSettings,
    },
  ];

  return (
    <>
      {isLoading ? (
        <Loading loading={isLoading} />
      ) : (
        <Layout
          title={title ? title : "Dashboard"}
          description={description ? description : "This is User Dashboard"}
        >
          <div className="bg-[#050505] min-h-screen user-dashboard-wrapper">
            <style dangerouslySetInnerHTML={{ __html: `
              .user-dashboard-wrapper {
                background-color: #050505 !important;
              }
              .user-dashboard-wrapper .bg-white {
                background-color: #0A0A0A !important;
                border-color: #171717 !important;
              }
              .user-dashboard-wrapper .border-gray-50,
              .user-dashboard-wrapper .border-gray-100,
              .user-dashboard-wrapper .border-gray-200,
              .user-dashboard-wrapper .divide-gray-100 > :not([hidden]) ~ :not([hidden]) {
                border-color: #171717 !important;
              }
              .user-dashboard-wrapper .bg-gray-50,
              .user-dashboard-wrapper .bg-gray-50\\/30 {
                background-color: #111111 !important;
              }
              .user-dashboard-wrapper .bg-gray-50\\/50 {
                background-color: #050505 !important;
              }
              .user-dashboard-wrapper text-gray-800,
              .user-dashboard-wrapper .text-gray-800,
              .user-dashboard-wrapper .text-gray-900,
              .user-dashboard-wrapper h1,
              .user-dashboard-wrapper h2,
              .user-dashboard-wrapper h3,
              .user-dashboard-wrapper h4 {
                color: #ffffff !important;
              }
              .user-dashboard-wrapper .text-gray-600 {
                color: #e5e5e5 !important;
              }
              .user-dashboard-wrapper .text-gray-500 {
                color: #a3a3a3 !important;
              }
              .user-dashboard-wrapper .text-gray-400 {
                color: #737373 !important;
              }
              
              /* Form Inputs styling */
              .user-dashboard-wrapper input,
              .user-dashboard-wrapper textarea,
              .user-dashboard-wrapper select {
                background-color: #050505 !important;
                color: #ffffff !important;
                border-color: #262626 !important;
              }
              .user-dashboard-wrapper input:focus,
              .user-dashboard-wrapper textarea:focus,
              .user-dashboard-wrapper select:focus {
                border-color: #D4AF37 !important;
                box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.15) !important;
              }
              
              /* Address modal and other modal slide overs */
              .user-dashboard-wrapper .bg-white.shadow-xl {
                background-color: #0A0A0A !important;
                border-left: 1px solid #171717 !important;
              }
              .user-dashboard-wrapper .border-gray-200 {
                border-color: #171717 !important;
              }
              .user-dashboard-wrapper label {
                color: #a3a3a3 !important;
              }
              
              /* Button overrides */
              .user-dashboard-wrapper .bg-store-500 {
                background-color: #D4AF37 !important;
                color: #000000 !important;
              }
              .user-dashboard-wrapper .bg-store-500:hover {
                background-color: #c29e2e !important;
              }
              .user-dashboard-wrapper .border-store-500 {
                border-color: #D4AF37 !important;
              }
              .user-dashboard-wrapper .text-store-600 {
                color: #D4AF37 !important;
              }
              .user-dashboard-wrapper .bg-store-50 {
                background-color: #1a1505 !important;
              }
              
              /* Tables styling */
              .user-dashboard-wrapper tr.hover\\:bg-gray-50\\/60:hover {
                background-color: rgba(255, 255, 255, 0.02) !important;
              }
              .user-dashboard-wrapper .divide-y > :not([hidden]) ~ :not([hidden]) {
                border-color: #171717 !important;
              }
              
              /* Status Badge customization for dark mode */
              .user-dashboard-wrapper .bg-emerald-100 {
                background-color: rgba(16, 185, 129, 0.15) !important;
                color: #10b981 !important;
                border-color: rgba(16, 185, 129, 0.2) !important;
              }
              .user-dashboard-wrapper .bg-amber-100 {
                background-color: rgba(245, 158, 11, 0.15) !important;
                color: #f59e0b !important;
                border-color: rgba(245, 158, 11, 0.2) !important;
              }
              .user-dashboard-wrapper .bg-indigo-100 {
                background-color: rgba(99, 102, 241, 0.15) !important;
                color: #818cf8 !important;
                border-color: rgba(99, 102, 241, 0.2) !important;
              }
              .user-dashboard-wrapper .bg-red-100 {
                background-color: rgba(239, 68, 68, 0.15) !important;
                color: #f87171 !important;
                border-color: rgba(239, 68, 68, 0.2) !important;
              }
              .user-dashboard-wrapper .bg-blue-100 {
                background-color: rgba(59, 130, 246, 0.15) !important;
                color: #60a5fa !important;
                border-color: rgba(59, 130, 246, 0.2) !important;
              }
              .user-dashboard-wrapper .bg-gray-100 {
                background-color: rgba(255, 255, 255, 0.08) !important;
                color: #d4d4d4 !important;
                border-color: rgba(255, 255, 255, 0.1) !important;
              }

              /* Notification List Items */
              .user-dashboard-wrapper .from-store-50\\/80 {
                --tw-gradient-from: rgba(212, 175, 55, 0.05) !important;
                --tw-gradient-to: #0A0A0A !important;
                --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
              }
              .user-dashboard-wrapper .to-white {
                --tw-gradient-to: #0A0A0A !important;
              }
              .user-dashboard-wrapper .hover\\:bg-gray-50\\/80:hover {
                background-color: rgba(255, 255, 255, 0.02) !important;
              }
              .user-dashboard-wrapper .border-store-200 {
                border-color: #171717 !important;
              }
              .user-dashboard-wrapper .from-store-100 {
                --tw-gradient-from: #111111 !important;
              }
              .user-dashboard-wrapper .to-store-200 {
                --tw-gradient-to: #1a1a1a !important;
              }
              .user-dashboard-wrapper .hover\\:bg-store-50:hover {
                background-color: rgba(212, 175, 55, 0.1) !important;
              }
              .user-dashboard-wrapper .hover\\:text-store-700:hover {
                color: #ffffff !important;
              }

              /* Address card special overrides */
              .user-dashboard-wrapper .border-store-500.bg-store-50\\/10 {
                border-color: #D4AF37 !important;
                background-color: rgba(212, 175, 55, 0.03) !important;
              }

              /* Address type badge */
              .user-dashboard-wrapper .bg-indigo-50 {
                background-color: rgba(99, 102, 241, 0.1) !important;
                color: #818cf8 !important;
                border-color: rgba(99, 102, 241, 0.2) !important;
              }
              .user-dashboard-wrapper .bg-amber-50 {
                background-color: rgba(245, 158, 11, 0.1) !important;
                color: #f59e0b !important;
                border-color: rgba(245, 158, 11, 0.2) !important;
              }
              
              /* Pagination styling */
              .user-dashboard-wrapper .page--item {
                border-color: #171717 !important;
                background-color: #0A0A0A !important;
              }
              .user-dashboard-wrapper .page--link {
                color: #a3a3a3 !important;
              }
              .user-dashboard-wrapper .page--link:hover {
                color: #ffffff !important;
              }
              .user-dashboard-wrapper .page-previous-link,
              .user-dashboard-wrapper .page-next-link {
                border-color: #171717 !important;
                background-color: #0A0A0A !important;
                color: #a3a3a3 !important;
              }
              .user-dashboard-wrapper .page-previous-link:hover,
              .user-dashboard-wrapper .page-next-link:hover {
                background-color: #D4AF37 !important;
                color: #000000 !important;
                border-color: #D4AF37 !important;
              }
              .user-dashboard-wrapper .activePagination {
                background: #D4AF37 !important;
                border-color: #D4AF37 !important;
                color: #000000 !important;
              }
            ` }} />
            <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
              <div className="py-10 lg:py-12 flex flex-col lg:flex-row w-full">
                <div className="flex-shrink-0 w-full lg:w-80 mr-7 lg:mr-10 xl:mr-10">
                  {/* Mobile Header */}
                  <div className="bg-[#0A0A0A] border border-neutral-900 p-4 rounded-xl mb-5 lg:hidden flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#D4AF37]/20 bg-neutral-900 flex items-center justify-center">
                        {userInfo?.image ? (
                          <img
                            src={userInfo.image}
                            alt={userInfo?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[#D4AF37] text-lg font-black">
                            {userInfo?.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white leading-tight">
                          {userInfo?.name}
                        </h2>
                        <span className="text-xs text-neutral-400">
                          {userInfo?.email || userInfo?.phone || "—"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-[#D4AF37] hover:bg-neutral-800 hover:text-white transition-all shadow-md"
                    >
                      <FiGrid className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Sidebar Menu */}
                  <div className={`${isOpen ? 'block' : 'hidden'} lg:block bg-[#0A0A0A] border border-neutral-900 p-6 rounded-xl shadow-lg sticky top-32`}>
                    {/* User Profile Header (Desktop) */}
                    <div className="hidden lg:flex flex-col items-center mb-8 pb-8 border-b border-neutral-900">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4 shadow-lg border-2 border-[#D4AF37]/30 bg-neutral-900 flex items-center justify-center">
                        {userInfo?.image ? (
                          <img
                            src={userInfo.image}
                            alt={userInfo?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[#D4AF37] text-3xl font-black">
                            {userInfo?.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-serif font-bold text-white text-center line-clamp-1">
                        {userInfo?.name}
                      </h2>
                      <p className="text-sm text-neutral-400 text-center line-clamp-1">
                        {userInfo?.email || userInfo?.phone || "—"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      {userSidebar?.map((item) => {
                        const isActive = router.pathname === item.href;
                        return (
                          <Link
                            key={item.title}
                            href={item.href}
                            className={`group flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 border ${
                              isActive
                                ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_4px_20px_rgba(212,175,55,0.15)]'
                                : 'text-neutral-400 border-transparent hover:bg-neutral-900/60 hover:text-white hover:border-neutral-800'
                            }`}
                          >
                            <item.icon
                              className={`flex-shrink-0 h-5 w-5 mr-3 transition-colors ${
                                isActive ? 'text-black' : 'text-neutral-500 group-hover:text-white'
                              }`}
                              aria-hidden="true"
                            />
                            {item.title}
                          </Link>
                        );
                      })}

                      <button
                        onClick={handleLogOut}
                        className="w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl text-red-500 hover:bg-red-950/20 border border-transparent hover:border-red-950/30 transition-all duration-200 mt-4 border-t border-neutral-900 pt-6"
                      >
                        <IoLockOpenOutline className="flex-shrink-0 h-5 w-5 mr-3" />
                        {showingTranslateValue(storeCustomizationSetting?.navbar?.logout) || "Logout"}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="w-full mt-4 lg:mt-0 lg:ml-4 overflow-hidden">
                  {!children && (
                    <div className="space-y-6">
                      <div className="mb-4">
                        <h2 className="text-2xl font-serif font-black text-white">
                          Welcome back, {userInfo?.name}!
                        </h2>
                        <p className="text-xs text-neutral-400 mt-1">
                          Manage your orders, saved addresses, and profile details below.
                        </p>
                      </div>

                      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                        {/* Main Customer Actions & Latest Order */}
                        <div className="lg:col-span-2 space-y-6">
                          {/* Latest Order Status (Flipkart style) */}
                          <div className="bg-[#0A0A0A] border border-neutral-900 rounded-2xl p-6 shadow-md">
                            <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-4">
                              Latest Order
                            </h3>
                            {data?.orders && data.orders.length > 0 ? (
                              (() => {
                                const latestOrder = data.orders[0];
                                return (
                                  <div className="space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-900 pb-3">
                                      <div>
                                        <span className="font-mono text-xs font-bold text-[#D4AF37] bg-yellow-950/40 px-2.5 py-1 rounded border border-yellow-900/30">
                                          #{latestOrder?._id?.slice(-6).toUpperCase()}
                                        </span>
                                        <span className="text-[11px] text-neutral-500 ml-3">
                                          Placed on {new Date(latestOrder.createdAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                        latestOrder.status === 'Delivered' ? 'bg-emerald-950/35 text-emerald-400 border-emerald-900/30' :
                                        latestOrder.status === 'Cancel' ? 'bg-red-950/35 text-red-400 border-red-900/30' :
                                        'bg-orange-950/35 text-orange-400 border-orange-900/30'
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                          latestOrder.status === 'Delivered' ? 'bg-emerald-500' :
                                          latestOrder.status === 'Cancel' ? 'bg-red-500' : 'bg-orange-500'
                                        }`} />
                                        {latestOrder.status}
                                      </span>
                                    </div>

                                    <div className="flex justify-between items-center py-1">
                                      <div className="text-sm font-bold text-white">
                                        Total: <span className="text-[#D4AF37]">{showingTranslateValue(storeCustomizationSetting?.theme?.currency) || "₹"}{parseFloat(latestOrder.total).toFixed(2)}</span>
                                      </div>
                                      <div className="flex gap-2.5">
                                        <Link
                                          href={`/order/${latestOrder._id}`}
                                          className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-xl transition-all duration-200"
                                        >
                                          View Details
                                        </Link>
                                        <Link
                                          href={`/order/${latestOrder._id}`}
                                          className="text-xs font-bold uppercase tracking-wider text-black bg-[#D4AF37] hover:bg-[#c29e2e] px-4 py-2 rounded-xl transition-all duration-200"
                                        >
                                          Track Package
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()
                            ) : (
                              <div className="py-6 text-center">
                                <p className="text-sm text-neutral-500 mb-4">You have not placed any orders yet.</p>
                                <Link
                                  href="/"
                                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-black bg-[#D4AF37] hover:bg-[#c29e2e] px-6 py-3 rounded-xl transition-all duration-200"
                                >
                                  <FiShoppingBag size={14} /> Shop Streetwear
                                </Link>
                              </div>
                            )}
                          </div>

                          {/* Recent Orders List (Flipkart style) */}
                          <RecentOrder data={data} loading={loading} error={error} />
                        </div>

                        {/* Right Column: Default Address Preview */}
                        <div>
                          <div className="bg-[#0A0A0A] border border-neutral-900 rounded-2xl p-6 shadow-md h-full flex flex-col justify-between">
                            <div>
                              <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-4">
                                Default Address
                              </h3>
                              {defaultAddress ? (
                                <div className="space-y-4">
                                  <div>
                                    <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-lg border bg-indigo-950/30 text-indigo-400 border-indigo-900/30">
                                      {defaultAddress.addressType || "Home"}
                                    </span>
                                    <h4 className="text-base font-bold text-white mt-2">
                                      {defaultAddress.name}
                                    </h4>
                                    <p className="text-xs text-neutral-400 mt-1 font-medium">
                                      {defaultAddress.phone}
                                    </p>
                                  </div>
                                  <p className="text-sm text-neutral-300 leading-relaxed border-t border-neutral-900 pt-3">
                                    {defaultAddress.address}, {defaultAddress.city}, {defaultAddress.country} - <span className="font-bold text-white">{defaultAddress.zipCode}</span>
                                  </p>
                                </div>
                              ) : (
                                <div className="py-6 text-center">
                                  <p className="text-xs text-neutral-500 leading-relaxed">No delivery addresses saved yet. Add a default shipping location.</p>
                                </div>
                              )}
                            </div>
                            <div className="mt-6">
                              <Link
                                href="/user/my-account"
                                className="w-full flex items-center justify-center gap-1.5 text-center text-xs font-black uppercase tracking-wider text-black bg-[#D4AF37] hover:bg-[#c29e2e] py-3 rounded-xl transition-all duration-200"
                              >
                                {defaultAddress ? "Edit Address" : "Add Address"}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {children}
                </div>
              </div>
            </div>
          </div>
        </Layout>
      )}
    </>
  );
};

export default dynamic(() => Promise.resolve(Dashboard), { ssr: false });
