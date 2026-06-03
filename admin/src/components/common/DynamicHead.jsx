import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import SettingServices from "@/services/SettingServices";
import { resolveCloudinaryUrl } from "@/utils/cloudinaryUrl";

const DynamicHead = () => {
  const { data: globalSetting } = useQuery({
    queryKey: ["globalSetting"],
    queryFn: async () => await SettingServices.getGlobalSetting(),
    staleTime: 20 * 60 * 1000,
    gcTime: 25 * 60 * 1000,
  });

  const { data: storeCustomizationSetting } = useQuery({
    queryKey: ["storeCustomizationSetting"],
    queryFn: async () => await SettingServices.getStoreCustomizationSetting(),
    staleTime: 20 * 60 * 1000,
    gcTime: 25 * 60 * 1000,
  });

  useEffect(() => {
    if (!globalSetting && !storeCustomizationSetting) return;

    // Get values from settings
    const shopName = globalSetting?.shop_name || "Farmacykart";
    const companyName = globalSetting?.company_name || shopName;
    const website = globalSetting?.website || window.location.origin;
    const email = globalSetting?.email || "";
    
    // SEO settings from storeCustomizationSetting
    const metaTitle = storeCustomizationSetting?.seo?.meta_title || `${shopName} | eCommerce Admin Dashboard`;
    const metaDescription = storeCustomizationSetting?.seo?.meta_description || "React eCommerce Admin Dashboard";
    const metaUrl = storeCustomizationSetting?.seo?.meta_url || website;
    const metaKeywords = storeCustomizationSetting?.seo?.meta_keywords || "ecommerce, admin, dashboard";
    const metaImage = storeCustomizationSetting?.seo?.meta_img || "";
    const favicon =
      resolveCloudinaryUrl(storeCustomizationSetting?.seo?.favicon) ||
      "/favicon.png";

    // Update document title
    if (metaTitle) {
      document.title = metaTitle;
    }

    // Update or create meta tags
    const updateMetaTag = (name, content, attribute = "name") => {
      if (!content) {
        // Remove tag if content is empty
        const existingElement = document.querySelector(`meta[${attribute}="${name}"]`);
        if (existingElement && existingElement.id) {
          existingElement.setAttribute("content", "");
        }
        return;
      }
      
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Update or create link tags
    const updateLinkTag = (rel, href) => {
      if (!href) return;
      
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        document.head.appendChild(element);
      }
      element.setAttribute("href", href);
    };

    // Update favicon
    updateLinkTag("icon", favicon);
    updateLinkTag("apple-touch-icon", favicon);

    // Update meta tags
    updateMetaTag("description", metaDescription);
    updateMetaTag("keywords", metaKeywords);
    updateMetaTag("theme-color", "#000000");

    // Update Open Graph tags
    updateMetaTag("og:title", metaTitle, "property");
    updateMetaTag("og:type", "eCommerce Website", "property");
    updateMetaTag("og:url", metaUrl, "property");
    updateMetaTag("og:description", metaDescription, "property");
    if (metaImage) {
      updateMetaTag("og:image", metaImage, "property");
    }

    // Update Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", metaTitle);
    updateMetaTag("twitter:description", metaDescription);
    if (metaImage) {
      updateMetaTag("twitter:image", metaImage);
    }

  }, [globalSetting, storeCustomizationSetting]);

  return null; // This component doesn't render anything
};

export default DynamicHead;

