import React, { useState } from "react";
import { Button, Input, Select } from "@windmill/react-ui";
import { FiTrash2, FiChevronUp, FiChevronDown, FiPlus } from "react-icons/fi";
import Uploader from "@/components/image-uploader/Uploader";
import { UK_SIZES } from "./FashionProductCoreFields";

const normalizeImageList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter((item) => typeof item === "string" && item);
  if (typeof val === "string" && val.trim()) return [val];
  return [];
};

const ColorVariantManager = ({ variants, setVariants, watch }) => {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const defaultOriginalPrice = Number(watch("originalPrice")) || 0;
  const defaultDiscount = Number(watch("discount")) || 0;
  const defaultDiscountType = watch("discountType") || "flat";

  const handleAddColor = () => {
    const newColor = {
      color: "",
      sku: "",
      price: defaultOriginalPrice,
      originalPrice: defaultOriginalPrice,
      discount: defaultDiscount,
      images: [],
      thumbnail: "",
      sizes: UK_SIZES.map((size) => ({
        size: size,
        quantity: 0,
        sku: "",
        price: 0,
        originalPrice: 0,
        enabled: true,
      })),
    };
    setVariants([...variants, newColor]);
    setExpandedIndex(variants.length);
  };

  const handleRemoveColor = (colorIdx) => {
    setVariants(variants.filter((_, i) => i !== colorIdx));
    if (expandedIndex === colorIdx) {
      setExpandedIndex(null);
    }
  };

  const handleUpdateColorField = (colorIdx, field, value) => {
    setVariants(
      variants.map((v, i) => {
        if (i === colorIdx) {
          const updated = { ...v, [field]: value };
          if (field === "color") {
            const baseSku = (watch("sku") || watch("productId") || "SKU")
              .toString()
              .replace(/\s+/g, "")
              .toUpperCase();
            const colorCode = value.toUpperCase().replace(/\s+/g, "");
            updated.sku = `${baseSku}-${colorCode}`;
            
            // Auto-update size SKUs based on new color SKU
            updated.sizes = (updated.sizes || []).map((s) => ({
              ...s,
              sku: `${updated.sku}-${s.size.replace(/\s+/g, "")}`,
            }));
          }
          return updated;
        }
        return v;
      })
    );
  };

  const handleUpdateSizeField = (colorIdx, sizeIdx, field, value) => {
    setVariants(
      variants.map((v, i) => {
        if (i === colorIdx) {
          const newSizes = v.sizes.map((s, sj) => {
            if (sj === sizeIdx) {
              return { ...s, [field]: value };
            }
            return s;
          });
          return { ...v, sizes: newSizes };
        }
        return v;
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-150 dark:border-gray-750">
        <div>
          <h3 className="text-md font-bold text-gray-800 dark:text-gray-200">
            Color Variants
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Manage product variations by Color. Set images and sizes per color.
            <span className="block mt-1 font-semibold text-teal-600">
              Stock: expand each color → fill &quot;Stock Qty&quot; for each UK size.
            </span>
          </p>
        </div>
        <Button
          type="button"
          onClick={handleAddColor}
          className="bg-[#008f89] hover:bg-[#00706b] text-white flex items-center gap-2"
        >
          <FiPlus /> Add Color Variant
        </Button>
      </div>

      {variants.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-400">
          No color variants added yet. Click "+ Add Color Variant" to start.
        </div>
      )}

      <div className="space-y-4">
        {variants.map((variant, colorIdx) => {
          const isExpanded = expandedIndex === colorIdx;
          const calculatedSellingPrice = (() => {
            const orig = Number(variant.originalPrice || defaultOriginalPrice) || 0;
            const disc = Number(variant.discount || defaultDiscount) || 0;
            const type = variant.discountType || defaultDiscountType;
            if (type === "percentage") {
              return orig - (orig * disc) / 100;
            }
            return orig - disc;
          })();

          return (
            <div
              key={colorIdx}
              className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 dark:bg-gray-750 rounded-t-lg"
                onClick={() => setExpandedIndex(isExpanded ? null : colorIdx)}
              >
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {variant.color || <span className="text-gray-400 italic">Unnamed Color</span>}
                  </span>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-md">
                    SKU: {variant.sku || "N/A"}
                  </span>
                  <span className="text-xs bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 px-2.5 py-1 rounded-md">
                    Stock: {variant.sizes?.reduce((sum, s) => sum + (s.enabled ? Number(s.quantity || 0) : 0), 0) || 0}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveColor(colorIdx);
                    }}
                    className="p-2 text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    <FiTrash2 size={18} />
                  </button>
                  <button type="button" className="p-1 focus:outline-none">
                    {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Body */}
              {isExpanded && (
                <div className="p-6 space-y-6 border-t border-gray-100 dark:border-gray-700">
                  {/* Color Details Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                        Color Name
                      </label>
                      <Input
                        value={variant.color || ""}
                        onChange={(e) => handleUpdateColorField(colorIdx, "color", e.target.value)}
                        placeholder="e.g. Black, Cloud White"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                        SKU Prefix
                      </label>
                      <Input
                        value={variant.sku || ""}
                        onChange={(e) => handleUpdateColorField(colorIdx, "sku", e.target.value)}
                        placeholder="e.g. SAMBA-BLK"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                        Color Price Override (₹)
                      </label>
                      <Input
                        type="number"
                        value={variant.originalPrice || ""}
                        onChange={(e) => handleUpdateColorField(colorIdx, "originalPrice", Number(e.target.value))}
                        placeholder={`Fallback: ${defaultOriginalPrice}`}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                        Selling Price (Calculated)
                      </label>
                      <div className="h-10 px-3 flex items-center bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-md text-sm font-semibold text-teal-600 dark:text-teal-400">
                        ₹ {calculatedSellingPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Images Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col">
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                        Color Thumbnail
                      </label>
                      <div className="border border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-900">
                        <Uploader
                          product={false}
                          folder="product"
                          imageUrl={variant.thumbnail}
                          setImageUrl={(url) => handleUpdateColorField(colorIdx, "thumbnail", url)}
                          useOriginalSize={true}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                        Color Hover Image
                      </label>
                      <div className="border border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-900">
                        <Uploader
                          product={false}
                          folder="product"
                          imageUrl={variant.hoverImage}
                          setImageUrl={(url) => handleUpdateColorField(colorIdx, "hoverImage", url)}
                          useOriginalSize={true}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                        Color Gallery Images
                      </label>
                      <div className="border border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-900">
                        <Uploader
                          product={true}
                          folder="product"
                          imageUrl={normalizeImageList(variant.images)}
                          setImageUrl={(next) => {
                            setVariants((prev) =>
                              prev.map((v, i) => {
                                if (i !== colorIdx) return v;
                                const current = normalizeImageList(v.images);
                                const resolved =
                                  typeof next === "function" ? next(current) : next;
                                return { ...v, images: normalizeImageList(resolved) };
                              })
                            );
                          }}
                          useOriginalSize={true}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Size Variants Stock Table */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      Size Stock Management (UK Sizes)
                    </h4>
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-gray-50 dark:bg-gray-750 text-gray-700 dark:text-gray-300 uppercase font-bold border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className="px-4 py-3 w-16">Active</th>
                            <th className="px-4 py-3 w-20">Size</th>
                            <th className="px-4 py-3 w-32">Stock Qty</th>
                            <th className="px-4 py-3">Custom SKU</th>
                            <th className="px-4 py-3">Override Price (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {variant.sizes?.map((sizeVar, sizeIdx) => {
                            return (
                              <tr
                                key={sizeIdx}
                                className={`${
                                  sizeVar.enabled
                                    ? "bg-white dark:bg-gray-800"
                                    : "bg-gray-50 dark:bg-gray-900/50 text-gray-400"
                                } hover:bg-gray-50 dark:hover:bg-gray-700/30`}
                              >
                                <td className="px-4 py-3">
                                  <input
                                    type="checkbox"
                                    checked={sizeVar.enabled !== false}
                                    onChange={(e) =>
                                      handleUpdateSizeField(
                                        colorIdx,
                                        sizeIdx,
                                        "enabled",
                                        e.target.checked
                                      )
                                    }
                                    className="w-4 h-4 rounded text-[#008f89] focus:ring-[#008f89] border-gray-300"
                                  />
                                </td>
                                <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                                  {sizeVar.size}
                                </td>
                                <td className="px-4 py-3">
                                  <Input
                                    type="number"
                                    disabled={sizeVar.enabled === false}
                                    value={sizeVar.enabled ? (sizeVar.quantity || 0) : ""}
                                    onChange={(e) =>
                                      handleUpdateSizeField(
                                        colorIdx,
                                        sizeIdx,
                                        "quantity",
                                        Number(e.target.value)
                                      )
                                    }
                                    placeholder="0"
                                    className="h-8 w-24 text-center"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <Input
                                    type="text"
                                    disabled={sizeVar.enabled === false}
                                    value={sizeVar.sku || ""}
                                    onChange={(e) =>
                                      handleUpdateSizeField(
                                        colorIdx,
                                        sizeIdx,
                                        "sku",
                                        e.target.value
                                      )
                                    }
                                    placeholder={`${variant.sku || "SKU"}-${sizeVar.size.replace(/\s+/g, "")}`}
                                    className="h-8 w-full max-w-xs"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <Input
                                    type="number"
                                    disabled={sizeVar.enabled === false}
                                    value={sizeVar.originalPrice || ""}
                                    onChange={(e) =>
                                      handleUpdateSizeField(
                                        colorIdx,
                                        sizeIdx,
                                        "originalPrice",
                                        Number(e.target.value)
                                      )
                                    }
                                    placeholder={`Fallback: ${variant.originalPrice || defaultOriginalPrice}`}
                                    className="h-8 w-32"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ColorVariantManager;
