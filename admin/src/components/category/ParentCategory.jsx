import { useState, useEffect, useCallback, useMemo } from "react";
import { Select } from "@windmill/react-ui";

import CategoryServices from "@/services/CategoryServices";
import SettingServices from "@/services/SettingServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import { sanitizeCategoryBanners } from "@/hooks/useShopCategoryBanners";

const SHOP_SLUGS = new Set(["footwear", "bags"]);

const getCategoryLabel = (node) => {
  if (!node?.name) return "";
  if (typeof node.name === "string") return node.name;
  return node.name.en || node.name.default || "";
};

const collectProductCategories = (tree = []) => {
  if (!Array.isArray(tree) || tree.length === 0) return [];

  const matched = [];

  const walk = (nodes) => {
    for (const node of nodes) {
      const slug = String(node?.slug || "").toLowerCase();
      const label = getCategoryLabel(node).toLowerCase();

      if (SHOP_SLUGS.has(slug)) {
        matched.push(node);
      } else if (
        label &&
        label !== "home" &&
        (label.includes("shoe") ||
          label.includes("sneaker") ||
          label.includes("footwear") ||
          label === "bags" ||
          label.includes("bag"))
      ) {
        matched.push(node);
      }

      if (node?.children?.length) walk(node.children);
    }
  };

  walk(tree);

  if (matched.length) {
    const seen = new Set();
    return matched.filter((cat) => {
      const id = String(cat._id);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }

  const homeNode = tree.find(
    (cat) =>
      String(cat?.slug || "").toLowerCase() === "home" ||
      getCategoryLabel(cat).toLowerCase() === "home"
  );
  if (homeNode?.children?.length) return homeNode.children;

  return tree.filter(
    (cat) => getCategoryLabel(cat).toLowerCase() !== "home"
  );
};

const ParentCategory = ({
  selectedCategory,
  setSelectedCategory,
  setDefaultCategory,
  defaultCategory,
}) => {
  const { showingTranslateValue } = useUtilsFunction();
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedSubId, setSelectedSubId] = useState("");

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const settingsRes = await SettingServices.getStoreCustomizationSetting();
      const setting = settingsRes?.setting || settingsRes;
      const banners = sanitizeCategoryBanners(
        setting?.rasaHomepage?.categoryBanners || []
      );

      if (banners.length) {
        await CategoryServices.syncShopCategories({ categories: banners });
      }

      const data = await CategoryServices.getAllCategory();
      setCategoryTree(Array.isArray(data) ? data : []);
    } catch {
      try {
        const data = await CategoryServices.getAllCategory();
        setCategoryTree(Array.isArray(data) ? data : []);
      } catch {
        setCategoryTree([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const parentCategories = useMemo(
    () => collectProductCategories(categoryTree),
    [categoryTree]
  );

  useEffect(() => {
    if (!categoryTree.length) return;

    const mainCategory = defaultCategory?.[0];
    if (!mainCategory?._id) return;

    const mainId = mainCategory._id;
    const isParent = parentCategories.some((cat) => cat._id === mainId);

    if (isParent) {
      setSelectedParentId(mainId);
      setSelectedSubId("");
      return;
    }

    const parent = categoryTree.find((cat) =>
      cat.children?.some((child) => child._id === mainId)
    );
    if (parent) {
      setSelectedParentId(parent._id);
      setSelectedSubId(mainId);
    }
  }, [categoryTree, defaultCategory, parentCategories]);

  const subCategories =
    parentCategories.find((c) => c._id === selectedParentId)?.children || [];

  const findObject = (categories, targetId) => {
    if (!Array.isArray(categories)) return undefined;
    for (const cat of categories) {
      if (cat._id === targetId) return cat;
      if (cat.children?.length) {
        const found = findObject(cat.children, targetId);
        if (found) return found;
      }
    }
    return undefined;
  };

  const addCategory = (id) => {
    if (!id) return;
    const result = findObject(categoryTree, id);
    if (!result) return;

    const already = selectedCategory.some((v) => v._id === result._id);
    if (already) return;

    const entry = {
      _id: result._id,
      name: showingTranslateValue(result.name),
    };

    setSelectedCategory((prev) => [...prev, entry]);
    setDefaultCategory(() => [entry]);
  };

  const handleParentChange = (e) => {
    const id = e.target.value;
    setSelectedParentId(id);
    setSelectedSubId("");

    const cat = parentCategories.find((c) => c._id === id);
    if (cat && (!cat.children || cat.children.length === 0)) {
      addCategory(id);
    }
  };

  const handleSubChange = (e) => {
    const id = e.target.value;
    setSelectedSubId(id);
    if (id) addCategory(id);
  };

  const handleRemove = (removedId) => {
    const updated = selectedCategory.filter((v) => v._id !== removedId);
    setSelectedCategory(updated);
    if (!updated.length) {
      setSelectedParentId("");
      setDefaultCategory([]);
    }
  };

  return (
    <div className="space-y-3">
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
            {showingTranslateValue(cat.name) || getCategoryLabel(cat)}
          </option>
        ))}
      </Select>

      {selectedParentId && subCategories.length > 0 && (
        <Select
          value={selectedSubId}
          onChange={handleSubChange}
          className="w-full border-gray-200 focus:border-[#008f89]"
        >
          <option value="">Select Sub-category</option>
          {subCategories.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {showingTranslateValue(sub.name) || getCategoryLabel(sub)}
            </option>
          ))}
        </Select>
      )}

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
