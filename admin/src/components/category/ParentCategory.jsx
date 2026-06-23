import { useState, useEffect } from "react";
import { Select } from "@windmill/react-ui";

// internal import
import useAsync from "@/hooks/useAsync";
import CategoryServices from "@/services/CategoryServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";

const ParentCategory = ({
  selectedCategory,
  setSelectedCategory,
  setDefaultCategory,
  defaultCategory,
}) => {
  const { data, loading } = useAsync(CategoryServices?.getAllCategory);
  const { showingTranslateValue } = useUtilsFunction();

  // Local state: which parent category is picked in the first dropdown
  const [selectedParentId, setSelectedParentId] = useState("");
  // Local state: which sub-category is picked in the second dropdown
  const [selectedSubId, setSelectedSubId] = useState("");

  // Sync selected dropdown values with defaultCategory on load
  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return;
    
    // Get the first item of defaultCategory as the main category
    const mainCategory = defaultCategory?.[0];
    if (!mainCategory || !mainCategory._id) return;

    const mainId = mainCategory._id;

    // Check if the mainId is a parent category
    const isParent = data.some((cat) => cat._id === mainId);
    if (isParent) {
      setSelectedParentId(mainId);
      setSelectedSubId("");
    } else {
      // Find the parent of this sub-category
      const parent = data.find((cat) => 
        cat.children?.some((child) => child._id === mainId)
      );
      if (parent) {
        setSelectedParentId(parent._id);
        setSelectedSubId(mainId);
      }
    }
  }, [data, defaultCategory]);

  // Top-level (parent) categories — those with no parent or at root level
  const parentCategories = Array.isArray(data) ? data : [];

  // Sub-categories of the chosen parent
  const subCategories = parentCategories.find(
    (c) => c._id === selectedParentId
  )?.children || [];

  // Helper: find a category object by id (recursive)
  const findObject = (categories, targetId) => {
    if (!categories || !Array.isArray(categories)) return undefined;
    for (const cat of categories) {
      if (cat._id === targetId) return cat;
      if (cat.children?.length > 0) {
        const found = findObject(cat.children, targetId);
        if (found) return found;
      }
    }
    return undefined;
  };

  // Push a category into the selectedCategory list (same logic as before)
  const addCategory = (id) => {
    if (!id) return;
    const result = findObject(data, id);
    if (!result) return;

    const already = selectedCategory.some((v) => v._id === result._id);
    if (already) return; // silently skip duplicate (matches original logic)

    const entry = {
      _id: result._id,
      name: showingTranslateValue(result.name),
    };

    setSelectedCategory((prev) => [...prev, entry]);
    setDefaultCategory(() => [entry]);
  };

  // When parent dropdown changes
  const handleParentChange = (e) => {
    const id = e.target.value;
    setSelectedParentId(id);
    setSelectedSubId(""); // reset sub-category

    // If the parent itself has no children, select it as the category
    const cat = parentCategories.find((c) => c._id === id);
    if (cat && (!cat.children || cat.children.length === 0)) {
      addCategory(id);
    }
  };

  // When sub-category dropdown changes
  const handleSubChange = (e) => {
    const id = e.target.value;
    setSelectedSubId(id);
    if (id) addCategory(id);
  };

  // Remove a selected category chip
  const handleRemove = (removedId) => {
    const updated = selectedCategory.filter((v) => v._id !== removedId);
    setSelectedCategory(updated);
  };

  return (
    <div className="space-y-3">
      {/* ── Category Dropdown ── */}
      <Select
        value={selectedParentId}
        onChange={handleParentChange}
        disabled={loading}
        className="w-full border-gray-200 focus:border-[#008f89]"
      >
        <option value="">
          {loading ? "Loading categories..." : "Select Category"}
        </option>
        {parentCategories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {showingTranslateValue(cat.name)}
          </option>
        ))}
      </Select>

      {/* ── Sub-category Dropdown (only shown when parent has children) ── */}
      {selectedParentId && subCategories.length > 0 && (
        <Select
          value={selectedSubId}
          onChange={handleSubChange}
          className="w-full border-gray-200 focus:border-[#008f89]"
        >
          <option value="">Select Sub-category</option>
          {subCategories.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {showingTranslateValue(sub.name)}
            </option>
          ))}
        </Select>
      )}

      {/* ── Selected Category Chips ── */}
      {selectedCategory.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {selectedCategory.map((cat) => (
            <span
              key={cat._id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#e6f4f3] text-[#008f89] border border-[#b2dedd]"
            >
              {cat.name}
              <button
                type="button"
                onClick={() => handleRemove(cat._id)}
                className="ml-1 text-[#008f89] hover:text-red-500 leading-none"
                title="Remove"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentCategory;
