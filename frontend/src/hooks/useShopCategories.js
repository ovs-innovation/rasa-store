import useGetSetting from "@hooks/useGetSetting";
import {
  normalizeShopCategories,
  shopCategoriesToNavItems,
} from "@utils/shopCategories";

const useShopCategories = () => {
  const { storeCustomizationSetting } = useGetSetting();
  const categoryBanners = storeCustomizationSetting?.rasaHomepage?.categoryBanners;
  const categories = normalizeShopCategories(categoryBanners);
  const navItems = shopCategoriesToNavItems(categories);

  return { categories, navItems };
};

export default useShopCategories;
