import React, { useContext } from "react";
import SidebarContent from "@/components/sidebar/SidebarContent";
import { SidebarContext } from "@/context/SidebarContext";

const DesktopSidebar = () => {
  const { sidebarCollapsed, toggleSidebarCollapse } = useContext(SidebarContext);

  return (
    <aside
      className={`z-30 flex-shrink-0 hidden overflow-y-auto bg-white dark:bg-[#004747] border-r border-gray-100 dark:border-gray-800 lg:block transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <SidebarContent
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
    </aside>
  );
};

export default DesktopSidebar;
