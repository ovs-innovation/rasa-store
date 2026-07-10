import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { IoLockOpenOutline } from "react-icons/io5";
import {
  FiBell,
  FiGrid,
  FiList,
  FiMenu,
  FiSettings,
  FiUser,
  FiShoppingBag,
  FiX,
} from "react-icons/fi";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

import Layout from "@layout/Layout";
import OrderServices from "@services/OrderServices";
import CustomerServices from "@services/CustomerServices";
import { UserContext } from "@context/UserContext";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { setToken } from "@services/httpServices";
import { UD } from "@components/user/userDashboardTheme";

const UserDashboardLayout = ({ title, description, children }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { state: userState, dispatch } = useContext(UserContext);
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue, currency } = useUtilsFunction();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userInfo = mounted ? userState?.userInfo || session?.user : null;
  const userId = userInfo?._id || userInfo?.id;
  const isAuthenticated = mounted && (!!userInfo?.token || status === "authenticated");

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders", { page: 1, user: userId }],
    queryFn: () => OrderServices.getOrderCustomer({ page: 1, limit: 5 }),
    enabled: isAuthenticated && !children,
  });

  useQuery({
    queryKey: ["shippingAddress", { id: userId }],
    queryFn: () => CustomerServices.getShippingAddress({ userId }),
    enabled: !!userId && isAuthenticated,
  });

  const handleLogOut = () => {
    signOut({ redirect: false });
    Cookies.remove("userInfo");
    Cookies.remove("couponInfo");
    setToken(null);
    dispatch({ type: "USER_LOGOUT" });
    router.push("/");
  };

  const navItems = [
    {
      title: showingTranslateValue(storeCustomizationSetting?.dashboard?.dashboard_title) || "Dashboard",
      href: "/user/dashboard",
      icon: FiGrid,
    },
    {
      title: showingTranslateValue(storeCustomizationSetting?.dashboard?.my_order) || "My Orders",
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
      title: showingTranslateValue(storeCustomizationSetting?.dashboard?.update_profile) || "Edit Profile",
      href: "/user/update-profile",
      icon: FiSettings,
    },
  ];

  const quickLinks = [
    { href: "/user/my-orders", icon: FiList, label: "Orders" },
    { href: "/user/my-account", icon: FiUser, label: "Account" },
    { href: "/user/update-profile", icon: FiSettings, label: "Profile" },
  ];

  const recentOrders = ordersData?.orders || [];

  const statusColor = (s) => {
    if (s === "Delivered") return "text-emerald-400 bg-emerald-950/40 border-emerald-900/30";
    if (s === "Cancel" || s === "Cancelled") return "text-red-400 bg-red-950/40 border-red-900/30";
    return "text-amber-400 bg-amber-950/40 border-amber-900/30";
  };

  const SidebarNav = ({ onNavigate }) => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = router.pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
              isActive
                ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {item.title}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={handleLogOut}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-red-400 hover:bg-red-950/20 transition-colors mt-4 pt-4 border-t border-neutral-800"
      >
        <IoLockOpenOutline className="w-4 h-4" />
        {showingTranslateValue(storeCustomizationSetting?.navbar?.logout) || "Logout"}
      </button>
    </nav>
  );

  if (!mounted) {
    return <div className="min-h-screen bg-[#050505]" aria-hidden="true" />;
  }

  return (
    <Layout title={title || "Dashboard"} description={description || "User Dashboard"}>
      <div className="bg-[#050505] min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="lg:hidden flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{userInfo?.name || "Account"}</p>
                <p className="text-xs text-neutral-500">{userInfo?.email || userInfo?.phone || ""}</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="p-2 rounded-lg border border-neutral-800 text-neutral-300"
                aria-label="Open menu"
              >
                <FiMenu className="w-5 h-5" />
              </button>
            </div>

            <aside className="hidden lg:block w-56 shrink-0">
              <div className={`${UD.panelPad} sticky top-28`}>
                <div className="mb-6 pb-5 border-b border-neutral-800">
                  <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#D4AF37] font-bold text-lg mb-3 overflow-hidden">
                    {userInfo?.image ? (
                      <img src={userInfo.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      userInfo?.name?.charAt(0).toUpperCase() || "?"
                    )}
                  </div>
                  <p className="text-sm font-medium text-white truncate">{userInfo?.name}</p>
                  <p className="text-xs text-neutral-500 truncate">{userInfo?.email || userInfo?.phone}</p>
                </div>
                <SidebarNav />
              </div>
            </aside>

            {menuOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-0 h-full w-72 bg-[#0A0A0A] border-l border-neutral-800 p-5">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-white font-medium">Menu</p>
                    <button type="button" onClick={() => setMenuOpen(false)} className="text-neutral-400">
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  <SidebarNav onNavigate={() => setMenuOpen(false)} />
                </div>
              </div>
            )}

            <main className="flex-1 min-w-0">
              {children || (
                <div className="space-y-6">
                  <div>
                    <h1 className={UD.pageTitle}>Hi, {userInfo?.name?.split(" ")[0] || "there"}</h1>
                    <p className={UD.pageSubtitle}>Manage your orders and account settings</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {quickLinks.map(({ href, icon: Icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className={`${UD.panel} p-4 flex flex-col items-center gap-2 text-center hover:border-neutral-700 transition-colors`}
                      >
                        <Icon className="w-5 h-5 text-[#D4AF37]" />
                        <span className="text-sm text-neutral-300">{label}</span>
                      </Link>
                    ))}
                  </div>

                  <div className={UD.panelPad}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className={UD.sectionTitle}>Recent Orders</h2>
                      {recentOrders.length > 0 && (
                        <Link href="/user/my-orders" className="text-xs text-[#D4AF37] hover:underline">
                          View all
                        </Link>
                      )}
                    </div>

                    {ordersLoading ? (
                      <p className={UD.muted}>Loading orders...</p>
                    ) : recentOrders.length === 0 ? (
                      <div className={UD.empty}>
                        <FiShoppingBag className="w-8 h-8 mx-auto mb-3 text-neutral-600" />
                        <p>No orders yet</p>
                        <Link href="/" className={`${UD.btnPrimary} mt-4`}>
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      <ul className="divide-y divide-neutral-800">
                        {recentOrders.map((order) => (
                          <li
                            key={order._id}
                            className="py-3 first:pt-0 last:pb-0 flex flex-wrap items-center justify-between gap-3"
                          >
                            <div>
                              <p className="text-sm font-medium text-white">
                                #{order._id?.slice(-6).toUpperCase()}
                              </p>
                              <p className="text-xs text-neutral-500 mt-0.5">
                                {dayjs(order.createdAt).format("DD MMM YYYY")}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs px-2 py-0.5 rounded border ${statusColor(order.status)}`}>
                                {order.status}
                              </span>
                              <span className="text-sm text-[#D4AF37] font-medium">
                                {currency}
                                {parseFloat(order.total || 0).toFixed(2)}
                              </span>
                              <Link href={`/order/${order._id}`} className={UD.btnGhost}>
                                View
                              </Link>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboardLayout;
