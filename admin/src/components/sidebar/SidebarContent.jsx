import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { Button } from "@windmill/react-ui";
import { IoLogOutOutline } from "react-icons/io5";
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";

import sidebar from "@/routes/sidebar";
import { AdminContext } from "@/context/AdminContext";
import { SidebarContext } from "@/context/SidebarContext";
import SidebarSubMenu from "@/components/sidebar/SidebarSubMenu";
import useGetCData from "@/hooks/useGetCData";
import { ADMIN_BRAND_LOGO } from "@/utils/cloudinaryUrl";

const SidebarContent = ({ collapsed = false, onToggleCollapse }) => {
  const { t } = useTranslation();
  const { dispatch } = useContext(AdminContext);
  const { globalSetting } = useContext(SidebarContext);
  const { accessList, role } = useGetCData();

  const allSidebarRouteKeys = sidebar
    .flatMap((route) => {
      if (route.routes) {
        return route.routes.map((r) => r.path?.split("?")[0].split("/")[1]);
      }
      if (route.path) {
        return [route.path.split("?")[0].split("/")[1]];
      }
      return [];
    })
    .filter(Boolean);

  const handleLogOut = () => {
    dispatch({ type: "USER_LOGOUT" });
    Cookies.remove("adminInfo");
  };

  const effectiveAccessList =
    role === "Super Admin" || role === "Admin"
      ? allSidebarRouteKeys
      : Array.isArray(accessList) && accessList.length > 0
        ? accessList.filter(Boolean)
        : allSidebarRouteKeys;

  const updatedSidebar = sidebar
    .map((route) => {
      if (route.routes) {
        const validSubRoutes = route.routes.filter((subRoute) => {
          const routeKey = subRoute.path?.split("?")[0].split("/")[1];
          return effectiveAccessList.includes(routeKey) || subRoute.outside || true;
        });

        if (validSubRoutes.length > 0) {
          return { ...route, routes: validSubRoutes };
        }
        return null;
      }

      if (route.type === "title") return route;
      const routeKey = route.path?.split("?")[0].split("/")[1];
      return routeKey && effectiveAccessList.includes(routeKey) ? route : null;
    })
    .filter(Boolean);

  return (
    <div className={`flex flex-col h-full py-4 text-gray-500 dark:text-[#9fb1b1] ${collapsed ? "items-center" : ""}`}>
      <div className={`flex items-center ${collapsed ? "flex-col gap-3 px-2" : "justify-between px-6"} mb-2`}>
        <a className="block text-gray-900 dark:text-gray-200 shrink-0" href="/dashboard">
          <img
            src={ADMIN_BRAND_LOGO}
            alt={globalSetting?.company_name || "RASA"}
            className={`object-contain ${collapsed ? "h-10 w-10" : "h-14 w-14"}`}
          />
        </a>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-emerald-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FiChevronsRight className="w-4 h-4" /> : <FiChevronsLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      <ul className={`mt-4 flex-1 overflow-y-auto w-full space-y-0.5 ${collapsed ? "px-1" : ""}`}>
        {updatedSidebar?.map((route) =>
          route.type === "title" ? (
            !collapsed && (
              <li className="px-6 py-3 mt-3 first:mt-0" key={route.name}>
                <span className="text-[10px] font-bold tracking-[0.12em] text-gray-400 dark:text-gray-500 uppercase">
                  {t(route.name)}
                </span>
              </li>
            )
          ) : route.routes ? (
            <SidebarSubMenu route={route} key={route.name} collapsed={collapsed} />
          ) : (
            <li className="relative" key={route.name}>
              <NavLink
                exact
                to={route.path}
                target={`${route?.outside ? "_blank" : "_self"}`}
                className={`inline-flex items-center w-full text-sm font-semibold transition-all duration-150 rounded-xl hover:text-emerald-500 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 ${
                  collapsed ? "justify-center px-3 py-3.5 mx-1" : "px-6 py-3.5 mx-2"
                }`}
                activeClassName="text-emerald-500 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-900/15"
                rel="noreferrer"
                title={collapsed ? t(route.name) : undefined}
              >
                <route.icon className="w-6 h-6 shrink-0" aria-hidden="true" />
                {!collapsed && <span className="ml-4">{t(route.name)}</span>}
              </NavLink>
            </li>
          )
        )}
      </ul>

      <span className={`block mt-4 ${collapsed ? "px-2" : "px-4"}`}>
        <Button onClick={handleLogOut} size="large" className={`w-full ${collapsed ? "!px-2" : ""}`}>
          <span className={`flex items-center ${collapsed ? "justify-center" : ""}`}>
            <IoLogOutOutline className={`text-lg ${collapsed ? "" : "mr-3"}`} />
            {!collapsed && <span className="text-sm">{t("LogOut")}</span>}
          </span>
        </Button>
      </span>
    </div>
  );
};

export default SidebarContent;
