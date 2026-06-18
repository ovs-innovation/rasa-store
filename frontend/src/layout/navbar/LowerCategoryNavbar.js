"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { IoChevronDown } from "react-icons/io5";

export default function LowerCategoryNavbar({
  categories: originalCategories = [],
  showingTranslateValue,
  variant = "row",
}) {
  const categories =
    originalCategories?.length > 0 ? originalCategories : [];
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);
  const closeTimerRef = useRef(null);
  const isInline = variant === "inline";

  useEffect(() => {
    setMounted(true);
  }, []);

  const getId = (cat) => String(cat?._id ?? "");

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
      : cat?.name?.en || cat?.name;
  };

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setActiveCategoryId(null), 250);
  };

  const openMenu = useCallback((category, anchorEl) => {
    clearCloseTimer();
    const id = getId(category);
    if (!anchorEl) return;

    const rect = anchorEl.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 6,
      left: rect.left + rect.width / 2,
    });
    setActiveCategoryId(id);
  }, []);

  useEffect(() => {
    if (!activeCategoryId) return;

    const updatePos = () => {
      const btn = dropdownRef.current?.querySelector(
        `[data-category-id="${activeCategoryId}"]`
      );
      if (btn) {
        const rect = btn.getBoundingClientRect();
        setMenuPos({ top: rect.bottom + 6, left: rect.left + rect.width / 2 });
      }
    };

    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [activeCategoryId]);

  useEffect(() => {
    const onDocDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        const portal = document.getElementById("category-nav-dropdown-portal");
        if (portal && portal.contains(e.target)) return;
        setActiveCategoryId(null);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  if (!categories || categories.length === 0) return null;

  const getUrl = (cat) => {
    if (!cat) return "/";
    const slug = String(cat.slug || createSlug(getName(cat)) || "").trim();
    if (!slug || slug === "/") return "/";
    if (slug === "new-arrivals") return "/new-arrivals";
    if (slug.startsWith("search?")) return `/${slug}`;
    if (slug.startsWith("footwear?brand=")) {
      const brandName = slug.split("=")[1];
      return `/search?category=footwear&brand=${brandName}`;
    }
    if (slug.startsWith("bags?type=")) {
      const bagType = slug.split("=")[1];
      return `/search?category=bags&type=${bagType}`;
    }
    return `/search?category=${slug}`;
  };
  const activeCategory = categories.find((c) => getId(c) === activeCategoryId);
  const hasChildren = activeCategory?.children?.length > 0;

  const dropdownMenu =
    mounted && activeCategory && (
      <div
        id="category-nav-dropdown-portal"
        className="fixed z-[9999] w-72 -translate-x-1/2"
        style={{ top: menuPos.top, left: menuPos.left }}
        onMouseEnter={clearCloseTimer}
        onMouseLeave={scheduleClose}
      >
        <div className="bg-[#0A0A0A] shadow-2xl shadow-black/60 rounded-none border border-neutral-800 py-2 overflow-hidden">
          <Link
            href={getUrl(activeCategory)}
            className="px-5 py-3 text-xs font-black text-[#D4AF37] uppercase tracking-widest block border-b border-neutral-800 hover:bg-[#D4AF37] hover:text-black transition-colors"
            onClick={() => setActiveCategoryId(null)}
          >
            View All {getName(activeCategory)}
          </Link>
          {hasChildren ? (
            <div className="max-h-[60vh] overflow-y-auto">
              {activeCategory.children.map((sub) => (
                <Link
                  key={sub._id}
                  href={getUrl(sub)}
                  onClick={() => setActiveCategoryId(null)}
                  className="block px-5 py-2.5 text-xs uppercase tracking-wider font-bold text-neutral-300 hover:bg-[#D4AF37] hover:text-black transition-colors"
                >
                  {getName(sub)}
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-5 py-2 text-[10px] uppercase tracking-wider font-bold text-neutral-500">Browse all products</p>
          )}
        </div>
      </div>
    );

  const wrapperClass = isInline
    ? "w-full min-w-0 relative"
    : "w-full border-t border-b border-neutral-900 bg-[#050505] relative";

  return (
    <div className={wrapperClass} ref={dropdownRef}>
      <div className={isInline ? "" : "max-w-screen-2xl mx-auto px-4 sm:px-8"}>
        <nav className="flex items-center justify-center gap-1 md:gap-3 lg:gap-4 py-0 overflow-x-auto no-scrollbar">
          {categories.map((category) => {
            const id = getId(category);
            const isActive = activeCategoryId === id;
            const showChevron = category?.children?.length > 0;

            return (
              <div
                key={id}
                className="relative shrink-0"
                onMouseEnter={(e) => {
                  if (window.innerWidth >= 1024) {
                    openMenu(category, e.currentTarget);
                  }
                }}
                onMouseLeave={() => {
                  if (window.innerWidth >= 1024) scheduleClose();
                }}
              >
                <button
                  type="button"
                  data-category-id={id}
                  onClick={(e) => {
                    if (window.innerWidth < 1024) {
                      if (isActive) setActiveCategoryId(null);
                      else openMenu(category, e.currentTarget);
                      return;
                    }
                    if (showChevron) {
                      if (isActive) setActiveCategoryId(null);
                      else openMenu(category, e.currentTarget);
                    } else {
                      window.location.href = getUrl(category);
                    }
                  }}
                  className={`flex items-center gap-1.5 font-black uppercase tracking-widest text-[11px] whitespace-nowrap rounded-none transition-all duration-300 border-b-2
                    ${isInline ? "px-2 py-1.5" : "px-3.5 py-3"}
                    ${isActive ? "text-white border-[#D4AF37] bg-transparent" : "text-neutral-400 border-transparent hover:text-white hover:border-[#D4AF37] bg-transparent"}`}
                >
                  {getName(category)}
                  <IoChevronDown
                    className={`text-[10px] transition-transform duration-300 ${isActive ? "rotate-180 text-white" : "text-neutral-500 group-hover:text-white"}`}
                  />
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      {mounted && dropdownMenu && createPortal(dropdownMenu, document.body)}

      <style jsx>{`
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
