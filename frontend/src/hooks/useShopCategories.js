import { useQuery } from "@tanstack/react-query";

import useGetSetting from "@hooks/useGetSetting";
import BrandServices from "@services/BrandServices";
import {
  normalizeShopCategories,
  shopCategoriesToNavItems,
} from "@utils/shopCategories";

const useShopCategories = () => {
  const { storeCustomizationSetting } = useGetSetting();
  const categoryBanners = storeCustomizationSetting?.rasaHomepage?.categoryBanners;
  const categories = normalizeShopCategories(categoryBanners);

  const { data: footwearBrands = [] } = useQuery({
    queryKey: ["showing-brands-nav", "footwear"],
    queryFn: () => BrandServices.getShowingBrands({ category: "footwear" }),
    staleTime: 1000 * 60 * 5,
  });

  const { data: bagsBrands = [] } = useQuery({
    queryKey: ["showing-brands-nav", "bags"],
    queryFn: () => BrandServices.getShowingBrands({ category: "bags" }),
    staleTime: 1000 * 60 * 5,
  });

  const navItems = shopCategoriesToNavItems(categories, {
    footwear: footwearBrands,
    bags: bagsBrands,
  });

  return { categories, navItems, footwearBrands, bagsBrands };
};

export default useShopCategories;
