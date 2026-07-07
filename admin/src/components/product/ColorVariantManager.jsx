import React from "react";
import { Button, Input } from "@windmill/react-ui";
import { FiTrash2, FiPlus } from "react-icons/fi";
import Uploader from "@/components/image-uploader/Uploader";
import { UK_SIZES } from "./FashionProductCoreFields";

const normalizeImageList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter((item) => typeof item === "string" && item);
  if (typeof val === "string" && val.trim()) return [val];
  return [];
};

const ColorVariantManager = ({ variants, setVariants }) => {
  const handleAddColor = () => {
    setVariants([
      ...variants,
      {
        color: "",
        images: [],
        sizes: UK_SIZES.map((size) => ({
          size,
          quantity: 0,
          enabled: false,
        })),
      },
    ]);
  };

  const handleRemoveColor = (colorIdx) => {
    setVariants(variants.filter((_, i) => i !== colorIdx));
  };

  const handleUpdateColorField = (colorIdx, field, value) => {
    setVariants(
      variants.map((v, i) => (i === colorIdx ? { ...v, [field]: value } : v))
    );
  };

  const handleUpdateSizeQty = (colorIdx, sizeIdx, quantity) => {
    setVariants(
      variants.map((v, i) => {
        if (i !== colorIdx) return v;
        const newSizes = v.sizes.map((s, sj) =>
          sj === sizeIdx
            ? {
                ...s,
                quantity: Number(quantity) || 0,
                enabled: Number(quantity) > 0,
              }
            : s
        );
        return { ...v, sizes: newSizes };
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add a color name, photos, and stock quantity for each size.
        </p>
        <Button
          type="button"
          onClick={handleAddColor}
          className="bg-[#008f89] hover:bg-[#00706b] text-white flex items-center gap-2 shrink-0"
        >
          <FiPlus /> Add Color
        </Button>
      </div>

      {variants.length === 0 && (
        <div className="text-center py-10 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 text-sm">
          No colors added yet. Click &quot;Add Color&quot; to get started.
        </div>
      )}

      {variants.map((variant, colorIdx) => (
        <div
          key={colorIdx}
          className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/40 p-5 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                Color Name
              </label>
              <Input
                value={variant.color || ""}
                onChange={(e) =>
                  handleUpdateColorField(colorIdx, "color", e.target.value)
                }
                placeholder="e.g. Black, White"
                className="w-full"
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemoveColor(colorIdx)}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 px-3 py-2"
            >
              <FiTrash2 size={16} />
              Remove
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Photos
            </label>
            <div className="border border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800">
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

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Size &amp; Stock
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {variant.sizes?.map((sizeVar, sizeIdx) => (
                <div
                  key={sizeVar.size}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3"
                >
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">
                    {sizeVar.size}
                  </p>
                  <label className="block text-[10px] uppercase tracking-wide text-gray-400 mb-1">
                    Stock
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={sizeVar.quantity || ""}
                    onChange={(e) =>
                      handleUpdateSizeQty(colorIdx, sizeIdx, e.target.value)
                    }
                    placeholder="0"
                    className="h-9 text-center text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ColorVariantManager;
