"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { IoChevronDown } from "react-icons/io5";

export default function LowerCategoryNavbar({ categories = [], showingTranslateValue }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveCategory(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = (id) => {
    if (window.innerWidth > 1024) {
      clearTimeout(timeoutRef.current);
      setActiveCategory(id);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth > 1024) {
      timeoutRef.current = setTimeout(() => {
        setActiveCategory(null);
      }, 150);
    }
  };

  const [dropdownTop, setDropdownTop] = useState(130);

  const handleToggle = (id, e) => {
    if (window.innerWidth <= 1024) {
      e.stopPropagation();
      if (activeCategory === id) {
        setActiveCategory(null);
      } else {
        const rect = e.currentTarget.getBoundingClientRect();
        setDropdownTop(rect.bottom + 5);
        setActiveCategory(id);
      }
    }
  };

  const createSlug = (name) => {
    if (!name) return "";
    return name
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const getName = (cat) => {
    return showingTranslateValue
      ? showingTranslateValue(cat?.name)
      : (cat?.name?.en || cat?.name);
  };

  if (!categories || categories.length === 0) return null;

  return (
    <div className="w-full bg-white border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] sticky top-[64px] lg:top-[80px] z-[60] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        <nav
          ref={dropdownRef}
          className="flex items-center lg:justify-center gap-1 md:gap-4 lg:gap-8 py-1.5 overflow-x-auto lg:overflow-visible no-scrollbar whitespace-nowrap"
        >
          {categories.map((category) => (
            <div
              key={category._id}
              className="relative group"
              onMouseEnter={() => handleMouseEnter(category._id)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={(e) => handleToggle(category._id, e)}
                className={`flex items-center gap-1.5 px-3 md:px-5 py-2.5 text-[13px] md:text-[14px] font-semibold tracking-wide transition-all duration-200 rounded-lg whitespace-nowrap
                  ${activeCategory === category._id
                    ? "text-store-600 bg-store-50"
                    : "text-gray-600 hover:text-store-600 hover:bg-gray-50 bg-white/50 backdrop-blur-sm"}`}>
                {getName(category)}

                {category?.children?.length > 0 && (
                  <IoChevronDown
                    className={`text-[10px] transition-transform duration-300 ${activeCategory === category._id ? "rotate-180 text-store-500" : "text-gray-400"}`}
                  />
                )}
              </button>

              {/* Enhanced Subcategory Dropdown */}
              {category?.children?.length > 0 && activeCategory === category._id && (
                <div
                  style={{ top: typeof window !== "undefined" && window.innerWidth <= 1024 ? `${dropdownTop}px` : undefined }}
                  className="fixed lg:absolute lg:top-full lg:!top-full z-[100] left-4 right-4 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:mt-2 lg:w-64 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200"
                >
                  <div className="bg-white shadow-[0_10px_40px_rgba(0,0,0,0.12)] rounded-xl border border-gray-100 py-3 backdrop-blur-sm bg-white/95">
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {/* Optional "Shop All" link can be added here if needed */}
                      <Link
                        href={`/search?category=${category.slug || createSlug(getName(category))}&_id=${category._id}`}
                        className="px-5 py-3 text-[13px] md:text-[14px] font-bold text-store-600 uppercase tracking-widest block border-b border-gray-50 mb-1 hover:bg-store-50 transition-colors"
                        onClick={() => setActiveCategory(null)}
                      >
                        View All {getName(category)}
                      </Link>

                      {category.children.map((sub) => (
                        <Link
                          key={sub._id}
                          href={`/search?category=${sub.slug || createSlug(getName(sub))}&_id=${sub._id}`}
                          onClick={() => setActiveCategory(null)}
                          className="group flex items-center justify-between px-5 py-3 md:py-3.5 text-[14px] md:text-[15px] text-gray-700 hover:bg-store-50 hover:text-store-600 transition-all border-l-4 border-transparent hover:border-store-500"
                        >
                          <span className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                            {getName(sub)}
                          </span>
                          <div className="w-1.5 h-1.5 rounded-full bg-store-400 opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
