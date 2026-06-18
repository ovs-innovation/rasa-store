import React, { useEffect, useState } from "react";
import { IoClose, IoStar } from "react-icons/io5";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import BrandServices from "@services/BrandServices";
import CategoryServices from "@services/CategoryServices";
import useUtilsFunction from "@hooks/useUtilsFunction";

const FilterSidebar = ({
  selectedBrands,
  setSelectedBrands,
  priceRange,
  setPriceRange,
  selectedCategories,
  setSelectedCategories,
  selectedRating,
  setSelectedRating,
  selectedDiscount,
  setSelectedDiscount,
  onClearAll,
}) => {
  const { showingTranslateValue, currency } = useUtilsFunction();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [openSections, setOpenSections] = useState({
    brand: false,
    rating: false,
    discount: false,
    category: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandData, categoryData] = await Promise.all([
          BrandServices.getShowingBrands(),
          CategoryServices.getShowingCategory(),
        ]);
        setBrands(brandData || []);
        const root = (categoryData || []).find(
          (c) => c.id === "Root" || c.name?.en?.toLowerCase() === "home"
        );
        setCategories(root?.children?.length ? root.children : categoryData || []);
      } catch (err) {
        console.error("Error fetching filter data", err);
      }
    };
    fetchData();
  }, []);

  const toggleCategory = (catId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleBrandChange = (brandId) => {
    setSelectedBrands(brandId);
  };

  const handleCategoryChange = (catId) => {
    setSelectedCategories(catId);
  };

  const handlePriceChange = (e, type) => {
    const value = parseInt(e.target.value) || 0;
    const newPriceRange = { ...priceRange, [type]: value };
    setPriceRange(newPriceRange);
  };

  const ratings = [4, 3, 2, 1];
  const discounts = [50, 40, 30, 20, 10];

  return (
    <div className="bg-[#0D0D0D] border border-neutral-800 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden font-sans">
      <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-[#050505]/40">
        <h2 className="text-sm font-black uppercase tracking-widest text-white">Filters</h2>
        <button
          onClick={onClearAll}
          className="text-[#D4AF37] text-xs font-black uppercase hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Active Filters */}
      {(selectedBrands.length > 0 ||
        selectedCategories.length > 0 ||
        selectedRating > 0 ||
        selectedDiscount > 0 ||
        priceRange.min > 0 ||
        priceRange.max < 100000) && (
        <div className="p-4 flex flex-wrap gap-2 border-b border-neutral-850 bg-[#050505]/20">
          {selectedBrands.map((brandId) => {
            const brand = brands.find((b) => b._id === brandId);
            if (!brand) return null;
            return (
              <span
                key={brandId}
                className="inline-flex items-center px-2 py-1 bg-neutral-900 border border-neutral-800 text-xs rounded-lg text-neutral-300"
              >
                {showingTranslateValue(brand.name)}
                <IoClose
                  className="ml-1.5 cursor-pointer text-neutral-500 hover:text-white"
                  onClick={() => handleBrandChange(brandId)}
                />
              </span>
            );
          })}
          {
            (() => {
              const tags = [];
              const consumed = new Set();

              for (const parentCat of categories) {
                if (parentCat.children && parentCat.children.length > 0) {
                  const childIds = parentCat.children.map((c) => c._id);
                  const allSelected = childIds.every((id) => selectedCategories.includes(id));
                  if (allSelected) {
                    tags.push({ id: parentCat._id, name: parentCat.name, isParent: true });
                    childIds.forEach((id) => consumed.add(id));
                    consumed.add(parentCat._id);
                  }
                }
              }

              for (const catId of selectedCategories) {
                if (consumed.has(catId)) continue;
                let cat = categories.find((c) => c._id === catId);
                if (!cat) {
                  for (const parentCat of categories) {
                    if (parentCat.children) {
                      const child = parentCat.children.find((c) => c._id === catId);
                      if (child) {
                        cat = child;
                        break;
                      }
                    }
                  }
                }
                if (cat) tags.push({ id: catId, name: cat.name, isParent: false });
              }

              return tags.map((t) => (
                <span key={t.id} className="inline-flex items-center px-2 py-1 bg-neutral-900 border border-neutral-800 text-xs rounded-lg text-neutral-300">
                  {showingTranslateValue(t.name)}
                  <IoClose
                    className="ml-1.5 cursor-pointer text-neutral-500 hover:text-white"
                    onClick={() => {
                      if (t.isParent) {
                        const parent = categories.find((c) => c._id === t.id);
                        const childIds = parent?.children?.map((c) => c._id) || [t.id];
                        handleCategoryChange(childIds);
                      } else {
                        handleCategoryChange(t.id);
                      }
                    }}
                  />
                </span>
              ));
            })()
          }
          {priceRange.min > 0 && (
            <span className="inline-flex items-center px-2 py-1 bg-neutral-900 border border-neutral-800 text-xs rounded-lg text-neutral-300">
              Min: {priceRange.min}
              <IoClose
                className="ml-1.5 cursor-pointer text-neutral-500 hover:text-white"
                onClick={() => setPriceRange((prev) => ({ ...prev, min: 0 }))}
              />
            </span>
          )}
          {priceRange.max < 100000 && (
            <span className="inline-flex items-center px-2 py-1 bg-neutral-900 border border-neutral-800 text-xs rounded-lg text-neutral-300">
              Max: {priceRange.max}
              <IoClose
                className="ml-1.5 cursor-pointer text-neutral-500 hover:text-white"
                onClick={() =>
                  setPriceRange((prev) => ({ ...prev, max: 100000 }))
                }
              />
            </span>
          )}
          {selectedRating > 0 && (
            <span className="inline-flex items-center px-2 py-1 bg-neutral-900 border border-neutral-800 text-xs rounded-lg text-neutral-300">
              {selectedRating}★ & above
              <IoClose
                className="ml-1.5 cursor-pointer text-neutral-500 hover:text-white"
                onClick={() => setSelectedRating(0)}
              />
            </span>
          )}
          {selectedDiscount > 0 && (
            <span className="inline-flex items-center px-2 py-1 bg-neutral-900 border border-neutral-800 text-xs rounded-lg text-neutral-300">
              {selectedDiscount}%+ Off
              <IoClose
                className="ml-1.5 cursor-pointer text-neutral-500 hover:text-white"
                onClick={() => setSelectedDiscount(0)}
              />
            </span>
          )}
        </div>
      )}

      {/* Categories */}
      <div className="border-b border-neutral-850">
        <button
          onClick={() => toggleSection("category")}
          className="w-full p-4 flex justify-between items-center text-xs font-black uppercase text-neutral-200 hover:bg-neutral-900/60 transition-colors"
        >
          Categories
          {openSections.category ? <FiChevronUp className="text-neutral-400" /> : <FiChevronDown className="text-neutral-400" />}
        </button>
        {openSections.category && (
          <div className="px-4 pb-4 max-h-96 overflow-y-auto">
            {categories.map((cat) => {
              const hasChildren = cat?.children && cat.children.length > 0;
              const isExpanded = expandedCategories[cat._id];
              
              return (
                <div key={cat._id} className="mb-2">
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center flex-1">
                      <input
                        type="checkbox"
                        id={`cat-${cat._id}`}
                        checked={
                          selectedCategories.includes(cat._id) || 
                          (cat.children && cat.children.length > 0 && cat.children.every((c) => selectedCategories.includes(c._id)))
                        }
                        onChange={() => {
                          const ids = (cat.children && cat.children.length > 0) ? [cat._id, ...cat.children.map(c => c._id)] : [cat._id];
                          handleCategoryChange(ids);
                        }}
                        className="rounded border-neutral-800 text-[#D4AF37] bg-neutral-950 focus:ring-[#D4AF37] focus:ring-offset-0 focus:outline-none w-4 h-4"
                      />
                      <label
                        htmlFor={`cat-${cat._id}`}
                        className="ml-2 text-sm font-medium text-neutral-300 cursor-pointer flex-1 hover:text-[#D4AF37] transition-colors"
                      >
                        {showingTranslateValue(cat.name)}
                      </label>
                    </div>
                    {hasChildren && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(cat._id);
                        }}
                        className="ml-2 p-1 text-neutral-500 hover:text-[#D4AF37] transition-colors"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? (
                          <FiChevronUp className="text-xs" />
                        ) : (
                          <FiChevronDown className="text-xs" />
                        )}
                      </button>
                    )}
                  </div>
                  
                  {hasChildren && isExpanded && (
                    <div className="ml-6 mt-2 mb-3 border-l-2 border-neutral-800 pl-4 space-y-2">
                      {cat.children.map((subCat) => (
                        <div key={subCat._id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`subcat-${subCat._id}`}
                            checked={selectedCategories.includes(subCat._id)}
                            onChange={() => handleCategoryChange(subCat._id)}
                            className="rounded border-neutral-800 text-[#D4AF37] bg-neutral-950 focus:ring-[#D4AF37] focus:ring-offset-0 focus:outline-none w-4 h-4"
                          />
                          <label
                            htmlFor={`subcat-${subCat._id}`}
                            className="ml-2 text-sm text-neutral-450 cursor-pointer hover:text-[#D4AF37] transition-colors"
                          >
                            {showingTranslateValue(subCat.name)}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="border-b border-neutral-850 p-4">
        <h3 className="text-xs font-black uppercase text-neutral-200 mb-4">Price</h3>
        <div className="flex items-center gap-2">
          <select
            value={priceRange.min}
            onChange={(e) => handlePriceChange(e, "min")}
            className="w-full text-xs bg-neutral-950 text-white border border-neutral-800 rounded-lg p-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] focus:outline-none"
          >
            <option value="0">0 {currency}</option>
            <option value="500">500 {currency}</option>
            <option value="1000">1000 {currency}</option>
            <option value="5000">5000 {currency}</option>
            <option value="10000">10000 {currency}</option>
            <option value="50000">50000 {currency}</option>
          </select>
          <span className="text-neutral-500 text-xs">to</span>
          <select
            value={priceRange.max}
            onChange={(e) => handlePriceChange(e, "max")}
            className="w-full text-xs bg-neutral-950 text-white border border-neutral-800 rounded-lg p-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] focus:outline-none"
          >
            <option value={priceRange.max}>
              {priceRange.max >= 100000 ? "Max" : `${priceRange.max} ${currency}`}
            </option>
            <option value="1000">1000 {currency}</option>
            <option value="5000">5000 {currency}</option>
            <option value="10000">10000 {currency}</option>
            <option value="50000">50000 {currency}</option>
            <option value="100000">100000 {currency}</option>
          </select>
        </div>
        <input
          type="range"
          min="0"
          max="100000"
          step="500"
          value={priceRange.max}
          onChange={(e) => handlePriceChange(e, "max")}
          className="w-full mt-4 h-1.5 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
          style={{
            background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${
              (priceRange.max / 100000) * 100
            }%, #262626 ${(priceRange.max / 100000) * 100}%, #262626 100%)`,
          }}
        />
      </div>

      {/* Brand */}
      <div className="border-b border-neutral-850">
        <button
          onClick={() => toggleSection("brand")}
          className="w-full p-4 flex justify-between items-center text-xs font-black uppercase text-neutral-200 hover:bg-neutral-900/60 transition-colors"
        >
          Brand
          {openSections.brand ? <FiChevronUp className="text-neutral-400" /> : <FiChevronDown className="text-neutral-400" />}
        </button>
        {openSections.brand && (
          <div className="px-4 pb-4 max-h-60 overflow-y-auto">
            {brands.map((brand) => (
              <div key={brand._id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`brand-${brand._id}`}
                  checked={selectedBrands.includes(brand._id)}
                  onChange={() => handleBrandChange(brand._id)}
                  className="rounded border-neutral-800 text-[#D4AF37] bg-neutral-950 focus:ring-[#D4AF37] focus:ring-offset-0 focus:outline-none w-4 h-4"
                />
                <label
                  htmlFor={`brand-${brand._id}`}
                  className="ml-2 text-sm text-neutral-350 cursor-pointer hover:text-[#D4AF37] transition-colors"
                >
                  {showingTranslateValue(brand.name)}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Ratings */}
      <div className="border-b border-neutral-850">
        <button
          onClick={() => toggleSection("rating")}
          className="w-full p-4 flex justify-between items-center text-xs font-black uppercase text-neutral-200 hover:bg-neutral-900/60 transition-colors"
        >
          Customer Ratings
          {openSections.rating ? <FiChevronUp className="text-neutral-400" /> : <FiChevronDown className="text-neutral-400" />}
        </button>
        {openSections.rating && (
          <div className="px-4 pb-4">
            {ratings.map((rating) => (
              <div
                key={rating}
                className="flex items-center mb-2 cursor-pointer group"
                onClick={() => setSelectedRating(rating)}
              >
                <input
                  type="radio"
                  name="rating"
                  checked={selectedRating === rating}
                  onChange={() => setSelectedRating(rating)}
                  className="text-[#D4AF37] bg-neutral-950 border-neutral-800 focus:ring-[#D4AF37] focus:ring-offset-0 focus:outline-none w-4 h-4"
                />
                <div className="ml-2 flex items-center text-sm text-neutral-350 group-hover:text-[#D4AF37] transition-colors">
                  {rating} <IoStar className="text-[#D4AF37] ml-1 mr-1" /> & above
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discount */}
      <div className="border-b border-neutral-850">
        <button
          onClick={() => toggleSection("discount")}
          className="w-full p-4 flex justify-between items-center text-xs font-black uppercase text-neutral-200 hover:bg-neutral-900/60 transition-colors"
        >
          Discount
          {openSections.discount ? <FiChevronUp className="text-neutral-400" /> : <FiChevronDown className="text-neutral-400" />}
        </button>
        {openSections.discount && (
          <div className="px-4 pb-4">
            {discounts.map((discount) => (
              <div
                key={discount}
                className="flex items-center mb-2 cursor-pointer group"
                onClick={() => setSelectedDiscount(discount)}
              >
                <input
                  type="radio"
                  name="discount"
                  checked={selectedDiscount === discount}
                  onChange={() => setSelectedDiscount(discount)}
                  className="text-[#D4AF37] bg-neutral-950 border-neutral-800 focus:ring-[#D4AF37] focus:ring-offset-0 focus:outline-none w-4 h-4"
                />
                <label className="ml-2 text-sm text-neutral-350 cursor-pointer group-hover:text-[#D4AF37] transition-colors">
                  {discount}% or more
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
