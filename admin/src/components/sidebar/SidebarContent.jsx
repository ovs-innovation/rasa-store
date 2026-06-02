import React, { useContext, useState } from "react";
import { NavLink, Route } from "react-router-dom";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { Button, WindmillContext } from "@windmill/react-ui";
import { IoLogOutOutline } from "react-icons/io5";

//internal import
import sidebar from "@/routes/sidebar";
// import SidebarSubMenu from "SidebarSubMenu";
import logoDark from "@/assets/img/logo/favicon.png";
import logoLight from "@/assets/img/logo/favicon.png";
import { AdminContext } from "@/context/AdminContext";
import { SidebarContext } from "@/context/SidebarContext";
import SidebarSubMenu from "@/components/sidebar/SidebarSubMenu";
import useGetCData from "@/hooks/useGetCData";

const SidebarContent = () => {
  const { t } = useTranslation();
  const { mode } = useContext(WindmillContext);
  const { dispatch } = useContext(AdminContext);
  const { globalSetting } = useContext(SidebarContext);
  const { accessList } = useGetCData();

  const handleLogOut = () => {
    dispatch({ type: "USER_LOGOUT" });
    Cookies.remove("adminInfo");
  };

  // Filter out undefined values from the Effective Access List
  const effectiveAccessList =
    Array.isArray(accessList) && accessList.length > 0
      ? accessList.filter(Boolean) // Remove undefined or falsy values
      : sidebar
        .map((route) => route.path?.split("?")[0].split("/")[1])
        .filter(Boolean);

  const updatedSidebar = sidebar
    .map((route) => {
      if (route.routes) {
        // Include all submenus regardless of accessList for now
        const validSubRoutes = route.routes.filter((subRoute) => {
          const routeKey = subRoute.path?.split("?")[0].split("/")[1];
          return (
            effectiveAccessList.includes(routeKey) || subRoute.outside || true // Include all submenus
          );
        });

        if (validSubRoutes.length > 0) {
          return { ...route, routes: validSubRoutes };
        }
        return null; // Exclude the main route if no sub-routes are valid
      }

      // Handle top-level routes
      if (route.type === "title") return route;
      const routeKey = route.path?.split("?")[0].split("/")[1];
      return routeKey && effectiveAccessList.includes(routeKey) ? route : null;
    })
    .filter(Boolean);

  return (
    <div className="py-4 text-gray-500 dark:text-[#9fb1b1]">
      <a className="block px-6 text-gray-900 dark:text-gray-200" href="/dashboard">
        {globalSetting?.logo ? (
            <img
              src={globalSetting?.logo}
              alt="Logo"
              className="h-16 w-auto max-w-[150px] object-contain mix-blend-multiply"
            />
          ) : mode === "dark" ? (
            <img
              src={logoLight}
              alt="Farmacykart"
              className="h-16 w-auto max-w-[150px] object-contain mix-blend-multiply"
            />
          ) : (
            <img
              src={logoDark}
              alt="Farmacykart"
              className="h-16 w-auto max-w-[150px] object-contain mix-blend-multiply"
            />
          )}
      </a>
      <ul className="mt-8">
        {updatedSidebar?.map((route) =>
          route.type === "title" ? (
            <li className="px-6 py-3 mt-4" key={route.name}>
              <span className="text-[11px] font-bold tracking-[0.05em] text-gray-500 dark:text-gray-400 uppercase">
                {t(route.name)}
              </span>
            </li>
          ) : route.routes ? (
            <SidebarSubMenu route={route} key={route.name} />
          ) : (
            <li className="relative" key={route.name}>
              <NavLink
                exact
                to={route.path}
                target={`${route?.outside ? "_blank" : "_self"}`}
                className="px-6 py-4 inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-emerald-500 dark:hover:text-white"
                activeClassName="text-emerald-500 dark:text-white"
                rel="noreferrer"
              >
                <route.icon className="w-5 h-5" aria-hidden="true" />
                <span className="ml-4">{t(`${route.name}`)}</span>
              </NavLink>
            </li>
          )
        )}
      </ul>
      <span className="px-4 py-4 block mt-4">
        <Button onClick={handleLogOut} size="large" className="w-full">
          <span className="flex items-center">
            <IoLogOutOutline className="mr-3 text-lg" />
            <span className="text-sm">{t("LogOut")}</span>
          </span>
        </Button>
      </span>
    </div>
  );
};

export default SidebarContent;
