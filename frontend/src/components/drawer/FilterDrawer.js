import React, { useContext } from "react";
import dynamic from "next/dynamic";
import Drawer from "rc-drawer";
import { IoClose } from "react-icons/io5";

import FilterSidebar from "@components/category/FilterSidebar";
import { SidebarContext } from "@context/SidebarContext";

const FilterDrawer = ({
  selectedBrands,
  setSelectedBrands,
  priceRange,
  setPriceRange,
  selectedCategories,
  setSelectedCategories,
  selectedDiscount,
  setSelectedDiscount,
  onClearAll,
}) => {
  const { filterDrawerOpen, closeFilterDrawer } = useContext(SidebarContext);

  return (
    <Drawer
      open={filterDrawerOpen}
      onClose={closeFilterDrawer}
      parent={null}
      level={null}
      placement={"right"}
      width="300px"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button onClick={closeFilterDrawer} className="p-2">
            <IoClose size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <FilterSidebar
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedDiscount={selectedDiscount}
            setSelectedDiscount={setSelectedDiscount}
            onClearAll={onClearAll}
          />
        </div>
      </div>
    </Drawer>
  );
};

export default dynamic(() => Promise.resolve(FilterDrawer), { ssr: false });
