import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import { IoSearchOutline } from "react-icons/io5";
import { FiTag, FiGrid, FiPackage } from "react-icons/fi";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { useQuery } from "@tanstack/react-query";
import ProductServices from "@services/ProductServices";
import BrandServices from "@services/BrandServices";
import CategoryServices from "@services/CategoryServices";
import Cookies from "js-cookie";

const SearchSuggestions = ({ searchText, onSelect, showSuggestions, onClose }) => {
  const router = useRouter();
  const { showingTranslateValue } = useUtilsFunction();
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const suggestionsRef = useRef(null);
  const previousKeyRef = useRef('');
  const previousSuggestionsLengthRef = useRef(0);

  // Fetch all data for suggestions (only once, cached)
  const { data: productsData } = useQuery({
    queryKey: ["searchSuggestionsProducts"],
    queryFn: async () => {
      const response = await ProductServices.getShowingStoreProducts({
        category: "",
        title: "",
        slug: "",
        brand: "",
      });
      return response?.products || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  const { data: brandsData } = useQuery({
    queryKey: ["searchSuggestionsBrands"],
    queryFn: async () => await BrandServices.getShowingBrands(),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["searchSuggestionsCategories"],
    queryFn: async () => await CategoryServices.getShowingCategory(),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // Debounce search
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchText]);

  // Use useMemo to calculate suggestions to avoid infinite loops
  // Don't include showingTranslateValue in dependencies as it's a stable function
  const matchedSuggestions = useMemo(() => {
    if (!showSuggestions || !debouncedSearchText || debouncedSearchText.trim().length < 2) {
      return [];
    }

    const query = debouncedSearchText.trim().toLowerCase();
    const results = [];

    // Search in Products
    if (productsData && Array.isArray(productsData)) {
      const cookie = Cookies.get("userInfo");
      let currentUser = null;
      try {
        currentUser = cookie ? JSON.parse(cookie) : null;
      } catch (e) {
        currentUser = null;
      }

      const matchedProducts = productsData
        .filter((product) => {
          const title = showingTranslateValue(product?.title)?.toLowerCase() || "";
          return title.includes(query);
        })
        .slice(0, 20)
        .reduce((acc, product) => {
          // Extract category ID properly
          let categoryId = null;
          if (product.category) {
            if (typeof product.category === 'object') {
              categoryId = product.category._id || product.category.id || null;
            } else if (typeof product.category === 'string') {
              categoryId = product.category;
            }
          }
          // Also check categories array
          if (!categoryId && product.categories && Array.isArray(product.categories) && product.categories.length > 0) {
            const firstCategory = product.categories[0];
            if (typeof firstCategory === 'object') {
              categoryId = firstCategory._id || firstCategory.id || null;
            } else if (typeof firstCategory === 'string') {
              categoryId = firstCategory;
            }
          }
          // Extract brand ID properly
          let brandId = null;
          if (product.brand) {
            if (typeof product.brand === 'object') {
              brandId = product.brand._id || product.brand.id || null;
            } else if (typeof product.brand === 'string') {
              brandId = product.brand;
            }
          }
          // Use product image if available, else fallback to icon
          let image = null;
          if (product.images && Array.isArray(product.images) && product.images[0]) {
            image = product.images[0];
          } else if (product.image && Array.isArray(product.image) && product.image[0]) {
            image = product.image[0];
          }

          acc.push({
            type: "product",
            id: product._id,
            title: showingTranslateValue(product?.title),
            slug: product.slug,
            category: categoryId,
            brand: brandId,
            image,
            icon: !image ? <FiPackage className="w-4 h-4" /> : null,
          });

          return acc;
        }, [])
        .slice(0, 5); // Limit to 5 final products

      results.push(...matchedProducts);
    }

    // Search in Brands
    if (brandsData && Array.isArray(brandsData)) {
      const matchedBrands = brandsData
        .filter((brand) => {
          const name = showingTranslateValue(brand?.name)?.toLowerCase() || "";
          const slug = brand.slug?.toLowerCase() || "";
          return name.includes(query) || slug.includes(query);
        })
        .slice(0, 3) // Limit to 3 brands
        .map((brand) => {
          // Prefer logo, then coverImage
          let image = brand.logo || brand.coverImage || null;
          return {
            type: "brand",
            id: brand._id,
            title: showingTranslateValue(brand?.name),
            slug: brand.slug,
            image,
            icon: !image ? <FiTag className="w-4 h-4" /> : null,
          };
        });
      results.push(...matchedBrands);
    }

    // Search in Categories
    if (categoriesData && Array.isArray(categoriesData)) {
      const allCategories = [];
      // Flatten categories including children
      categoriesData.forEach((cat) => {
        if (cat.children && Array.isArray(cat.children)) {
          allCategories.push(...cat.children);
        } else {
          allCategories.push(cat);
        }
      });

      const matchedCategories = allCategories
        .filter((category) => {
          const name = showingTranslateValue(category?.name)?.toLowerCase() || "";
          return name.includes(query);
        })
        .slice(0, 3) // Limit to 3 categories
        .map((category) => {
          // Use icon as image if available
          let image = category.icon || null;
          return {
            type: "category",
            id: category._id,
            title: showingTranslateValue(category?.name),
            slug: category.slug,
            image,
            icon: !image ? <FiGrid className="w-4 h-4" /> : null,
          };
        });
      results.push(...matchedCategories);
    }

    return results;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchText, productsData, brandsData, categoriesData, showSuggestions]);

  // Helper function to create comparison key from suggestions (without React elements)
  const getSuggestionsKey = (suggs) => {
    if (!suggs || !Array.isArray(suggs) || suggs.length === 0) return '';
    // Create a simple string key from serializable data only (no React elements)
    return suggs.map(s => 
      `${s.type || ''}-${s.id || ''}-${s.title || ''}-${s.slug || ''}-${s.category || ''}-${s.brand || ''}`
    ).join('||');
  };

  // Update suggestions and loading state when matchedSuggestions changes
  useEffect(() => {
    // Skip if conditions not met
    if (!showSuggestions || !debouncedSearchText || debouncedSearchText.trim().length < 2) {
      // Only clear if we previously had suggestions
      if (previousSuggestionsLengthRef.current > 0) {
        previousKeyRef.current = '';
        previousSuggestionsLengthRef.current = 0;
        setSuggestions([]);
        setIsLoading(false);
      }
      return;
    }

    // Only process if we have debounced search text
    if (debouncedSearchText.trim().length >= 2 && Array.isArray(matchedSuggestions)) {
      // Create comparison key from serializable data only (avoid React elements)
      const currentKey = getSuggestionsKey(matchedSuggestions);
      const previousKey = previousKeyRef.current || '';
      
      // Only update if suggestions actually changed (compare keys, not full objects)
      if (currentKey !== previousKey) {
        // Store only the key string, not the full array with React elements
        previousKeyRef.current = currentKey;
        previousSuggestionsLengthRef.current = matchedSuggestions.length;
        
        // Update loading state and suggestions
        setIsLoading(true);
        
        // Batch state updates to avoid race conditions
        const timer = setTimeout(() => {
          setSuggestions(matchedSuggestions);
          setIsLoading(false);
        }, 0);

        return () => clearTimeout(timer);
      } else if (isLoading) {
        // If suggestions didn't change but we're loading, stop loading
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedSuggestions, showSuggestions, debouncedSearchText]);

  const handleSuggestionClick = async (e, suggestion) => {
    // Close suggestions immediately
    if (onClose) onClose();
    
    // Extract IDs as strings
    const getStringId = (id) => {
      if (!id) return null;
      if (typeof id === 'object') {
        return String(id._id || id.id || '');
      }
      return String(id);
    };
    
    let targetPath = '';
    let targetQuery = {};
    
    if (suggestion.type === "product") {
      // Use category or brand from suggestion to show related products
      const categoryId = getStringId(suggestion.category);
      const brandId = getStringId(suggestion.brand);
      
      // Navigate to search page with category/brand filter to show related products
      if (categoryId && categoryId !== 'undefined' && categoryId !== 'null' && categoryId.trim() !== '') {
        targetPath = '/search';
        targetQuery = { _id: categoryId };
      } else if (brandId && brandId !== 'undefined' && brandId !== 'null' && brandId.trim() !== '') {
        targetPath = '/search';
        targetQuery = { brand: brandId };
      } else {
        // Fallback to product page if no category/brand
        targetPath = `/product/${suggestion.slug}`;
      }
    } else if (suggestion.type === "brand") {
      const brandId = getStringId(suggestion.id);
      if (brandId) {
        targetPath = '/search';
        targetQuery = { brand: brandId };
      }
    } else if (suggestion.type === "category") {
      const categoryId = getStringId(suggestion.id);
      if (categoryId) {
        targetPath = '/search';
        targetQuery = { _id: categoryId };
      }
    }
    
    if (targetPath) {
      try {
        if (targetPath === '/search' && Object.keys(targetQuery).length > 0) {
          // Use router.push with object format for search page
          await router.push(
            {
              pathname: targetPath,
              query: targetQuery,
            },
            undefined,
            { shallow: false }
          );
        } else {
          // Use router.push for product page
          await router.push(targetPath, undefined, { shallow: false });
        }
      } catch (error) {
        console.error("Navigation error:", error);
        // Fallback to window.location if router.push fails
        const url = targetPath === '/search' && Object.keys(targetQuery).length > 0
          ? `${targetPath}?${new URLSearchParams(targetQuery).toString()}`
          : targetPath;
        window.location.href = url;
      }
    }
    
    if (onSelect) onSelect();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside suggestions and not on the input
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        // Also check if it's not the search input
        const searchInput = event.target.closest('input[type="text"]');
        if (!searchInput) {
          if (onClose) onClose();
        }
      }
    };

    if (showSuggestions) {
      // Use a slight delay to allow mousedown events to process first
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions, onClose]);

  if (!showSuggestions || !searchText || searchText.trim().length < 1) {
    return null;
  }

  return (
    <div
      ref={suggestionsRef}
      className="search-suggestions-container absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] max-h-96 overflow-y-auto"
      style={{ position: 'absolute', zIndex: 100 }}
    >
      {isLoading ? (
        <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
      ) : suggestions.length > 0 ? (
        <div className="py-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.id}-${index}`}
              type="button"
              onClick={(e) => {
                // Don't prevent default in onClick - let navigation happen
                handleSuggestionClick(e, suggestion);
              }}
              onMouseDown={(e) => {
                // Prevent input blur on mousedown but allow click
                e.preventDefault();
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left cursor-pointer"
            >
              {suggestion.image ? (
                <span className="flex-shrink-0 w-7 h-7 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img src={suggestion.image} alt={suggestion.title} className="object-contain w-7 h-7" />
                </span>
              ) : (
                <span className="text-gray-400 flex-shrink-0">{suggestion.icon}</span>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">
                  {suggestion.title}
                </div>
                <div className="text-xs text-gray-500 capitalize">{suggestion.type}</div>
              </div>
              <IoSearchOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500 text-sm">
          No suggestions found for "{searchText}"
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;

