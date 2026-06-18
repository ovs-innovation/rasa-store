import React from "react";
import { Input, Select } from "@windmill/react-ui";
import ParentCategory from "@/components/category/ParentCategory";
import Multiselect from "multiselect-react-dropdown";

export const UK_SIZES = ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10"];

const FashionProductCoreFields = ({
  register,
  errors,
  brand,
  setBrand,
  brandOptions,
  language,
  selectedCategory,
  setSelectedCategory,
  setDefaultCategory,
  defaultCategory,
  selectedUkSizes = [],
  onToggleUkSize,
  stockRegister,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
      <h2 className="text-lg font-black uppercase tracking-widest text-gray-800 dark:text-gray-200">
        RASA Product Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Brand <span className="text-red-500">*</span>
          </label>
          <Select
            value={brand?._id || ""}
            onChange={(e) => {
              const selected = brandOptions?.find((item) => item._id === e.target.value);
              setBrand(selected || null);
            }}
            className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          >
            <option value="" className="dark:bg-gray-800">Select brand</option>
            {brandOptions?.map((item) => (
              <option key={item._id} value={item._id} className="dark:bg-gray-800">
                {item.name?.en || item.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <ParentCategory
            lang={language}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            setDefaultCategory={setDefaultCategory}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Category
          </label>
          <Multiselect
            displayValue="name"
            isObject={true}
            singleSelect={true}
            onSelect={(v) => setDefaultCategory(v)}
            selectedValues={defaultCategory}
            options={selectedCategory}
            placeholder="Default Category"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Gender
          </label>
          <Select {...register("gender")} className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
            <option value="" className="dark:bg-gray-800">Select gender</option>
            <option value="Men" className="dark:bg-gray-800">Men</option>
            <option value="Women" className="dark:bg-gray-800">Women</option>
            <option value="Unisex" className="dark:bg-gray-800">Unisex</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SKU</label>
          <Input {...register("sku")} placeholder="SKU-001" className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Stock <span className="text-red-500">*</span>
          </label>
          <Input type="number" min="0" {...(stockRegister || register("stock"))} placeholder="0" className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Barcode</label>
          <Input {...register("barcode")} placeholder="Barcode" className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Available Sizes (UK)
        </label>
        <div className="flex flex-wrap gap-2">
          {UK_SIZES.map((size) => {
            const active = selectedUkSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => onToggleUkSize?.(size)}
                className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-md border transition-colors ${
                  active
                    ? "bg-[#D4AF37] border-[#D4AF37] text-black"
                    : "bg-transparent border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#D4AF37]"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Select sizes available for this product. Use Attributes below to generate color × size variants.
        </p>
      </div>
    </div>
  );
};

export default FashionProductCoreFields;
