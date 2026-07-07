import { Button, Input } from "@windmill/react-ui";
import { FiSave } from "react-icons/fi";

import Loading from "@/components/preloader/Loading";
import Uploader from "@/components/image-uploader/Uploader";
import useShopCategoryBanners, { CATEGORY_META } from "@/hooks/useShopCategoryBanners";
import SectionVisibilityToggle from "@/components/common/SectionVisibilityToggle";

const CategoryBannerEditor = ({ categoryType, banner, onChange, onReset }) => {
  const meta = CATEGORY_META[categoryType];

  return (
    <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 space-y-3 bg-gray-50 dark:bg-gray-900/40">
      <div className="flex justify-between items-center gap-3">
        <div>
          <span className="text-xs font-bold uppercase text-teal-600 dark:text-teal-400">
            {meta.label}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{meta.description}</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 px-2 py-1 shrink-0"
        >
          Reset
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Input
          value={banner?.title || ""}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="Title (e.g. Shoes)"
          className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
        />
        <Input
          value={banner?.slug || ""}
          onChange={(e) => onChange("slug", e.target.value)}
          placeholder="Slug (e.g. footwear)"
          className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
          Category Image
        </label>
        <Uploader
          folder="rasa/categories"
          imageUrl={banner?.image}
          setImageUrl={(url) => onChange("image", url)}
        />
      </div>
    </div>
  );
};

const ShopCategoryBannersEditor = () => {
  const {
    loading,
    saving,
    shoesCategory,
    bagsCategory,
    categoriesSectionEnabled,
    setCategoriesSectionEnabled,
    setCategoryByType,
    resetCategory,
    save,
  } = useShopCategoryBanners();

  if (loading) return <Loading loading={loading} />;

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">
            Shop by Categories
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Shoes & Bags on homepage, mobile menu, and nav. Saved to database.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <SectionVisibilityToggle
            enabled={categoriesSectionEnabled}
            onChange={() => setCategoriesSectionEnabled(!categoriesSectionEnabled)}
            label="Show on homepage"
          />
          <Button onClick={save} disabled={saving} className="bg-teal-600 hover:bg-teal-700 shrink-0">
            <FiSave className="mr-2" />
            {saving ? "Saving..." : "Save Categories"}
          </Button>
        </div>
      </div>

      <CategoryBannerEditor
        categoryType="footwear"
        banner={shoesCategory}
        onChange={(field, value) => setCategoryByType("footwear", field, value)}
        onReset={() => resetCategory("footwear")}
      />
      <CategoryBannerEditor
        categoryType="bags"
        banner={bagsCategory}
        onChange={(field, value) => setCategoryByType("bags", field, value)}
        onReset={() => resetCategory("bags")}
      />
    </section>
  );
};

export default ShopCategoryBannersEditor;
