import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { SidebarContext } from "@/context/SidebarContext";
import BrandServices from "@/services/BrandServices";
import useTranslationValue from "./useTranslationValue";

const toSlug = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

const useBrandSubmit = (id) => {
  const { isDrawerOpen, closeDrawer, setIsUpdate, lang, showAlert } =
    useContext(SidebarContext);
  const [resData, setResData] = useState({});
  const [logoUrl, setLogoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [showOnHomepage, setShowOnHomepage] = useState(true);
  const [shopCategories, setShopCategories] = useState({
    footwear: false,
    bags: false,
  });
  const [language, setLanguage] = useState("en");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handlerTextTranslateHandler } = useTranslationValue();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm();

  const handleSelectLanguage = (value) => {
    setLanguage(value);
    if (Object.keys(resData).length > 0) {
      setValue("name", resData?.name?.[value] || "");
      setValue("description", resData?.description?.[value] || "");
    }
  };

  const onSubmit = async ({
    name,
    description,
    slug,
    websiteUrl,
    sortOrder,
  }) => {
    try {
      setIsSubmitting(true);

      const nameTranslates = await handlerTextTranslateHandler(
        name,
        language,
        resData?.name
      );
      const descriptionTranslates = await handlerTextTranslateHandler(
        description,
        language,
        resData?.description
      );

      const parsedSortOrder =
        sortOrder !== undefined &&
        sortOrder !== null &&
        `${sortOrder}`.length > 0
          ? Number(sortOrder)
          : 0;

      const payload = {
        name: {
          ...(resData?.name || {}),
          ...(nameTranslates || {}),
          [language]: name,
        },
        description: {
          ...(resData?.description || {}),
          ...(descriptionTranslates || {}),
          [language]: description || "",
        },
        slug: slug ? toSlug(slug) : toSlug(name),
        websiteUrl: websiteUrl || "",
        sortOrder: parsedSortOrder,
        logo: logoUrl,
        coverImage: coverUrl,
        isFeatured: featured,
        showOnHomepage,
        shopCategories: Object.entries(shopCategories)
          .filter(([, enabled]) => enabled)
          .map(([category]) => category),
        status: published ? "show" : "hide",
      };

      if (id) {
        const res = await BrandServices.updateBrand(id, payload);
        showAlert(res.message, "success");
      } else {
        const res = await BrandServices.addBrand(payload);
        showAlert(res.message, "success");
      }

      setIsSubmitting(false);
      setIsUpdate(true);
      closeDrawer();
      reset();
    } catch (err) {
      showAlert(err?.response?.data?.message || err?.message, "error");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      setResData({});
      setValue("name");
      setValue("description");
      setValue("slug");
      setValue("websiteUrl");
      setValue("sortOrder");
      setLogoUrl("");
      setCoverUrl("");
      setPublished(true);
      setFeatured(false);
      setShowOnHomepage(true);
      setShopCategories({ footwear: false, bags: false });
      clearErrors("name");
      clearErrors("description");
      setLanguage(lang);
      return;
    }

    if (id) {
      (async () => {
        try {
          const res = await BrandServices.getBrandById(id);
          setResData(res);
          setValue("name", res?.name?.[language] || "");
          setValue("description", res?.description?.[language] || "");
          setValue("slug", res?.slug || "");
          setValue("websiteUrl", res?.websiteUrl || "");
          setValue("sortOrder", res?.sortOrder ?? 0);
          setLogoUrl(res?.logo || "");
          setCoverUrl(res?.coverImage || "");
          setPublished(res?.status !== "hide");
          setFeatured(!!res?.isFeatured);
          setShowOnHomepage(res?.showOnHomepage !== false);
          const savedCategories = Array.isArray(res?.shopCategories)
            ? res.shopCategories
            : [];
          setShopCategories({
            footwear: savedCategories.includes("footwear"),
            bags: savedCategories.includes("bags"),
          });
        } catch (err) {
          showAlert(err?.response?.data?.message || err?.message, "error");
        }
      })();
    }
  }, [id, isDrawerOpen, setValue, language, clearErrors, lang]);

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    logoUrl,
    setLogoUrl,
    coverUrl,
    setCoverUrl,
    published,
    setPublished,
    featured,
    setFeatured,
    showOnHomepage,
    setShowOnHomepage,
    shopCategories,
    setShopCategories,
    handleSelectLanguage,
    isSubmitting,
  };
};

export default useBrandSubmit;

