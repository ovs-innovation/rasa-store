import combinate from "combinate";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import swal from "sweetalert";

//internal import
import useAsync from "@/hooks/useAsync";
import useUtilsFunction from "./useUtilsFunction";
import { SidebarContext } from "@/context/SidebarContext";
import AttributeServices from "@/services/AttributeServices";
import ProductServices from "@/services/ProductServices";
import BrandServices from "@/services/BrandServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import useTranslationValue from "./useTranslationValue";

const generateVariantSku = (baseSku, index) => {
  const sanitized =
    (baseSku || "SKU").toString().replace(/\s+/g, "").toUpperCase() || "SKU";
  const suffix = (index + 1).toString().padStart(3, "0");
  return `${sanitized}-${suffix}`;
};

const normalizeImageList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter((item) => typeof item === "string" && item);
  if (typeof val === "string" && val.trim()) return [val];
  return [];
};

const mapStatusForForm = (status) => {
  if (status === "show") return "Published";
  if (status === "hide" || status === "hidden") return "Hidden";
  if (status === "draft") return "Draft";
  if (status === "out-of-stock" || status === "Out Of Stock") return "Out Of Stock";
  return status || "Published";
};

const mapStatusForApi = (status) => {
  if (status === "Published") return "show";
  if (status === "Hidden") return "hide";
  if (status === "Draft") return "draft";
  if (status === "Out Of Stock") return "out-of-stock";
  return status || "show";
};

const sumVariantStock = (variantList = []) =>
  variantList.reduce((total, variant) => {
    const sizes = Array.isArray(variant.sizes) ? variant.sizes : [];
    return (
      total +
      sizes.reduce(
        (sizeTotal, size) =>
          sizeTotal +
          (size.enabled === false ? 0 : Number(size.quantity || size.stock || 0)),
        0
      )
    );
  }, 0);

const ensureVariantsHaveSku = (variantList, baseSku) =>
  (variantList || []).map((variant, idx) => {
    const colorVal = variant.color || variant.colorName || "";
    const colorSku = variant?.sku && variant.sku.toString().trim().length > 0
      ? variant.sku
      : `${baseSku || "SKU"}-${colorVal.toUpperCase().replace(/\s+/g, "")}`;
    
    const existingSizes = variant.sizes || [];
    const sizesMap = new Map(existingSizes.map(s => [s.size, s]));
    
    const normalizedSizes = ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10"].map(size => {
      const match = sizesMap.get(size);
      const qty = match ? (typeof match.quantity === "number" ? match.quantity : Number(match.stock || 0)) : 0;
      return {
        size,
        quantity: qty,
        sku: match?.sku || `${colorSku}-${size.replace(/\s+/g, "")}`,
        price: match?.price || 0,
        originalPrice: match?.originalPrice || 0,
        enabled: match ? match.enabled !== false : qty > 0
      };
    });

    return {
      ...variant,
      color: colorVal,
      sku: colorSku,
      images: normalizeImageList(variant.images || (variant.image ? [variant.image] : [])),
      thumbnail: variant.thumbnail || variant.image || "",
      hoverImage: variant.hoverImage || "",
      sizes: normalizedSizes
    };
  });

const useProductSubmit = (id) => {
  const location = useLocation();
  const { isDrawerOpen, closeDrawer, setIsUpdate, lang } =
    useContext(SidebarContext);

  const { data: attribue } = useAsync(AttributeServices.getShowingAttributes);
  const { data: brandOptions } = useAsync(BrandServices.getAllBrands);

  // react ref
  const resetRef = useRef([]);
  const resetRefTwo = useRef("");

  // react hook
  const [imageUrl, setImageUrl] = useState([]);
  const [featuredImage, setFeaturedImage] = useState("");
  const [hoverImage, setHoverImage] = useState("");
  const [badge, setBadge] = useState("");
  const [video, setVideo] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [seoImage, setSeoImage] = useState("");
  const [tag, setTag] = useState([]);
  const [values, setValues] = useState({});
  let [variants, setVariants] = useState([]);
  const [variant, setVariant] = useState([]);
  const [totalStock, setTotalStock] = useState(0);
  const [quantity, setQuantity] = useState(0);

  const [originalPrice, setOriginalPrice] = useState(0);
  const [price, setPrice] = useState(0);
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [isBasicComplete, setIsBasicComplete] = useState(false);
  const [tapValue, setTapValue] = useState("Basic Info");
  const [isCombination, setIsCombination] = useState(false);
  const [attTitle, setAttTitle] = useState([]);
  const [variantTitle, setVariantTitle] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [productId, setProductId] = useState("");
  const [updatedId, setUpdatedId] = useState(id);
  const [imgId, setImgId] = useState("");
  const [isBulkUpdate, setIsBulkUpdate] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [defaultCategory, setDefaultCategory] = useState([]);
  const [resData, setResData] = useState({});
  const [language, setLanguage] = useState("en");
  const [openModal, setOpenModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState(null);
  const [dynamicSections, setDynamicSections] = useState([]);
  const [mediaSections, setMediaSections] = useState([]);
  const [previewVariants, setPreviewVariants] = useState([]);
  const [selectedPreviewVariants, setSelectedPreviewVariants] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // New Sections State
  const [productDescription, setProductDescription] = useState({ enabled: true, icon: "", title: "Product Description", description: "" });
  const [additionalInformation, setAdditionalInformation] = useState({ enabled: true, icon: "", title: "Additional Information", subsections: [] });
  const [productHighlights, setProductHighlights] = useState({ enabled: true, icon: "", title: "Product Highlights", items: [] });
  const [manufacturerDetails, setManufacturerDetails] = useState({ enabled: true, icon: "", title: "Manufacturer Details", items: [] });
  const [disclaimer, setDisclaimer] = useState({ enabled: true, icon: "", title: "Disclaimer", description: "" });
  const [faqSection, setFaqSection] = useState({ enabled: true, icon: "", title: "FAQ", items: [] });

  const { handlerTextTranslateHandler } = useTranslationValue();
  const { showingTranslateValue, getNumber, getNumberTwo } = useUtilsFunction();

  const handleRemoveEmptyKey = (obj) => {
    for (const key in obj) {
      if (obj[key].trim() === "") {
        delete obj[key];
      }
    }
    // console.log("obj", obj);
    return obj;
  };

  // handle click
  const onCloseModal = () => setOpenModal(false);
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      hsnCode: "",
      taxRate: 0,
      isPriceInclusive: true,
      discountType: "flat",
    },
  });

  // console.log("res", resData);

  const onSubmit = async (data) => {
    // console.log('data is data',data)
    try {
      setIsSubmitting(true);
      if (!imageUrl?.length) {
        setIsSubmitting(false);
        return notifyError("Image is required!");
      }

      if (data.discountType === "percentage") {
        if (Number(data.discount) > 100) {
          setIsSubmitting(false);
          return notifyError("Discount percentage cannot exceed 100%!");
        }
      } else {
        if (Number(data.discount) > Number(data.originalPrice)) {
          setIsSubmitting(false);
          return notifyError(
            "Discount must be less than or equal to product price!"
          );
        }
      }
      if (!defaultCategory[0]) {
        setIsSubmitting(false);
        return notifyError("Default Category is required!");
      }

      const baseSkuValue = data.sku || sku || productId || "SKU";
      
      const updatedVariants = variants.map((cv, idx) => {
        const cvOriginal = getNumberTwo(cv.originalPrice || data.originalPrice || 0);
        const cvDiscount = getNumberTwo(cv.discount || data.discount || 0);
        const cvBaseDiscountedPrice = data.discountType === "percentage" 
          ? cvOriginal - (cvOriginal * cvDiscount / 100)
          : cvOriginal - cvDiscount;
        const cvPrice = cvBaseDiscountedPrice * (1 + Number(data.taxRate || 0) / 100);

        const colorSku = cv.sku || `${baseSkuValue}-${(cv.color || "").toUpperCase().replace(/\s+/g, "")}`;
        
        const sizes = Array.isArray(cv.sizes) ? cv.sizes : [];
        const updatedSizes = sizes.map((sv, sIdx) => {
          const svOriginal = getNumberTwo(sv.originalPrice || cvOriginal);
          const svDiscount = getNumberTwo(sv.discount || cvDiscount);
          const svBaseDiscounted = data.discountType === "percentage"
            ? svOriginal - (svOriginal * svDiscount / 100)
            : svOriginal - svDiscount;
          const svPrice = svBaseDiscounted * (1 + Number(data.taxRate || 0) / 100);
          return {
            ...sv,
            originalPrice: svOriginal,
            price: svPrice,
            quantity: sv.enabled === false ? 0 : Number(sv.quantity || 0),
            sku: sv.sku || `${colorSku}-${(sv.size || "").replace(/\s+/g, "")}`,
            enabled: sv.enabled !== false
          };
        });

        return {
          ...cv,
          sku: colorSku,
          price: cvPrice,
          originalPrice: cvOriginal,
          discount: cvDiscount,
          sizes: updatedSizes
        };
      });

      setIsBasicComplete(true);
      const basePriceAfterDiscount = data.discountType === "percentage" 
        ? getNumberTwo(data.originalPrice) - (getNumberTwo(data.originalPrice) * getNumber(data.discount) / 100)
        : getNumberTwo(data.originalPrice) - getNumber(data.discount);
      
      const taxRateValue = Number(data.taxRate || 0);
      const calculatedPrice = basePriceAfterDiscount * (1 + taxRateValue / 100);

      // Compute total stock sum across all variants
      const computedTotalStock = updatedVariants.reduce((sum, cv) => {
        return sum + cv.sizes.reduce((sSum, sv) => sSum + Number(sv.quantity || 0), 0);
      }, 0);

      const hasColorVariants = updatedVariants.length > 0;
      const finalStock = hasColorVariants
        ? computedTotalStock
        : Number(data.stock ?? 0);

      setTotalStock(finalStock);
      setPrice(calculatedPrice);
      setQuantity(finalStock);
      setBarcode(data.barcode);
      setSku(data.sku);
      setOriginalPrice(data.originalPrice);

      const titleTranslates = await handlerTextTranslateHandler(
        data.title,
        language,
        resData?.title
      );
      const descriptionTranslates = await handlerTextTranslateHandler(
        data.description,
        language,
        resData?.description
      );
      const highlightsTranslates = await handlerTextTranslateHandler(
        data.highlights,
        language,
        resData?.highlights
      );

      const sanitizeDynamicSections = (sections) =>
        (sections || [])
          .filter((section) => section?.name?.trim())
          .map((section) => ({
            name: section.name.trim(),
            description: section.description || "",
            isVisible: section?.isVisible !== false,
            subsections: (section.subsections || [])
              .filter((subsection) => {
                if (!subsection) return false;
                if (subsection.type === "paragraph") {
                  return Boolean(subsection.content?.trim());
                }
                return (
                  Boolean(subsection.key?.trim()) ||
                  Boolean(subsection.value?.trim())
                );
              })
              .map((subsection) => ({
                title: subsection.title || "",
                type: subsection.type === "paragraph" ? "paragraph" : "keyValue",
                key:
                  subsection.type === "paragraph"
                    ? ""
                    : subsection.key?.trim() || "",
                value:
                  subsection.type === "paragraph"
                    ? ""
                    : subsection.value?.trim() || "",
                content:
                  subsection.type === "paragraph"
                    ? subsection.content || ""
                    : subsection.content || "",
                isVisible: subsection?.isVisible !== false,
              })),
          }));

      const sanitizeMediaSections = (sections) =>
        (sections || [])
          .filter((section) => section?.name?.trim())
          .map((section) => ({
            name: section.name.trim(),
            description: section.description || "",
            isVisible: section?.isVisible !== false,
            items: (section.items || [])
              .filter(
                (item) =>
                  item?.image?.trim() &&
                  item?.details?.trim()
              )
              .map((item) => ({
                image: item.image.trim(),
                details: item.details.trim(),
              })),
          }));

      const buildVariantFilters = (variantList, baseSkuCode) => {
        if (!variantList?.length) return [];
        const flat = [];
        variantList.forEach((cv) => {
          const color = cv.color || "";
          const sizes = cv.sizes || [];
          sizes.forEach((sv) => {
            if (sv.enabled !== false) {
              flat.push({
                sku: sv.sku,
                barcode: sv.barcode || cv.barcode || "",
                attributes: {
                  color: color,
                  size: sv.size
                },
                combinationLabel: `${color} ${sv.size}`,
                price: sv.price,
                originalPrice: sv.originalPrice,
                quantity: sv.quantity
              });
            }
          });
        });
        return flat;
      };

      const variantFiltersPayload = buildVariantFilters(
        updatedVariants,
        baseSkuValue
      );

      const productData = {
        productId: productId,
        sku: data.sku || "",
        barcode: data.barcode || "",
        hsnCode: data.hsnCode?.trim() || "",
        taxRate:
          typeof data.taxRate === "number"
            ? data.taxRate
            : Number(data.taxRate || 0),
        isPriceInclusive: Boolean(data.isPriceInclusive),
        title: {
          ...titleTranslates,
          [language]: data.title,
        },
        description: {
          ...descriptionTranslates,
          [language]: data.description || "",
        },
        highlights: {
          ...highlightsTranslates,
          [language]: data.highlights || "",
        },
        slug: data.slug
          ? data.slug
          : data.title.toLowerCase().replace(/[^A-Z0-9]+/gi, "-"),

        categories: selectedCategory.map((item) => item._id),
        category: defaultCategory[0]._id,

        image: imageUrl,
        thumbnail: thumbnailUrl,
        stock: finalStock,
        tag: Array.isArray(tag) ? tag : tag ? [tag] : [],

        gender: data.gender || "",
        productType: data.productType || "",
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
        seoImage: seoImage || "",
        featuredImage: featuredImage || "",
        hoverImage: hoverImage || "",
        video: video || "",
        badge: badge || "",
        status: mapStatusForApi(data.status || "Published"),
        lowStockAlert: typeof data.lowStockAlert === "number" ? data.lowStockAlert : Number(data.lowStockAlert || 5),

        prices: {
          price: getNumberTwo(data.price) || getNumberTwo(data.originalPrice),
          originalPrice: getNumberTwo(data.originalPrice),
          salePrice: data.salePrice ? getNumberTwo(data.salePrice) : 0,
          discount: Math.max(0, getNumberTwo(data.originalPrice) - (getNumberTwo(data.salePrice) || getNumberTwo(data.price) || getNumberTwo(data.originalPrice))),
          discountType: "flat",
        },
        isCombination: hasColorVariants,
        variants: hasColorVariants ? updatedVariants : [],
        variantFilters: variantFiltersPayload,
        brand: brand?._id || null,
        dynamicSections: sanitizeDynamicSections(dynamicSections),
        mediaSections: sanitizeMediaSections(mediaSections),
        faqs: faqSection,
        
        // New Sections
        productDescription,
        additionalInformation,
        productHighlights,
        manufacturerDetails,
        disclaimer,
      };

      // console.log("productData ===========>", productData, "data", data);
      // return setIsSubmitting(false);

      if (updatedId) {
        const res = await ProductServices.updateProduct(updatedId, productData);
        if (res) {
          // Update form fields with response to ensure UI reflects server values
          if (isCombination) {
            setIsUpdate(true);
            notifySuccess(res.message);
            setIsBasicComplete(true);
            setIsSubmitting(false);
            handleProductTap("Combination", true);
          } else {
            setIsUpdate(true);
            notifySuccess(res.message);
            setIsSubmitting(false);
          }
        }

        if (
          tapValue === "Combination" ||
          (tapValue !== "Combination" && !isCombination)
        ) {
          closeDrawer();
        }
      } else {
        const res = await ProductServices.addProduct(productData);
        // console.log("res is ", res);
        if (isCombination) {
          setUpdatedId(res._id);
          setValue("title", res.title[language ? language : "en"]);
          setValue("description", res.description[language ? language : "en"]);
          setValue("slug", res.slug);
          setValue("show", res.show);
          setValue("barcode", res.barcode);
          setValue("stock", res.stock);
          setValue("hsnCode", res?.hsnCode || "");
          setValue(
            "taxRate",
            typeof res?.taxRate === "number"
              ? res.taxRate
              : Number(res?.taxRate || 0)
          );
          setValue("isPriceInclusive", Boolean(res?.isPriceInclusive));
          let parsedTags = [];
          try {
            parsedTags = typeof res.tag === "string" ? JSON.parse(res.tag) : (Array.isArray(res.tag) ? res.tag : [res.tag].filter(Boolean));
          } catch (e) {
            parsedTags = res.tag ? [res.tag] : [];
          }
          setTag(parsedTags);
          setImageUrl(res.image);
          setFeaturedImage(res.featuredImage || "");
          setHoverImage(res.hoverImage || "");
          setBadge(res.badge || "");
          setVideo(res.video || "");
          const normalizedResponseVariants = ensureVariantsHaveSku(
            res.variants || [],
            res.sku || res.productId || "SKU"
          );
          setVariants(normalizedResponseVariants);
          setDynamicSections(res.dynamicSections || []);
          setMediaSections(res.mediaSections || []);
          setFaqSection(res.faqs || { enabled: true, icon: "", title: "FAQ", items: [] });
          setValue("productId", res.productId);
          setValue("gender", res.gender || "");
          setValue("productType", res.productType || "");
          setValue("metaTitle", res.metaTitle || "");
          setValue("metaDescription", res.metaDescription || "");
          setSeoImage(res.seoImage || "");
          setValue("status", mapStatusForForm(res.status));
          setValue("lowStockAlert", res.lowStockAlert || 5);
          setValue("originalPrice", res?.prices?.originalPrice || 0);
          setValue("price", res?.prices?.price || 0);
          setValue("salePrice", res?.prices?.salePrice || 0);
          setProductId(res.productId);
          setOriginalPrice(res?.prices?.originalPrice);
          setPrice(res?.prices?.price);
          setBarcode(res.barcode);
          setSku(res.sku);
          const result = normalizedResponseVariants.map(
            ({
              originalPrice,
              price,
              discount,
              quantity,
              barcode,
              sku,
              productId,
              image,
              ...rest
            }) => rest
          );

          setVariant(result);
          setIsUpdate(true);
          setIsBasicComplete(true);
          setIsSubmitting(false);
          handleProductTap("Combination", true);
          notifySuccess("Product Added Successfully!");
        } else {
          setIsUpdate(true);
          notifySuccess("Product Added Successfully!");

          setDynamicSections(res.dynamicSections || []);
          setMediaSections(res.mediaSections || []);
          setFaqSection(res.faqs || { enabled: true, icon: "", title: "FAQ", items: [] });
        }

        if (
          tapValue === "Combination" ||
          (tapValue !== "Combination" && !isCombination)
        ) {
          setIsSubmitting(false);
          closeDrawer();
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      const msg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        err?.message;
      notifyError(msg || "Failed to save product");
    }
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      setSlug("");
      setLanguage(lang);
      setValue("language", language);
      handleProductTap("Basic Info", true);
      setResData({});
      setValue("sku");
      setValue("title");
      setValue("slug");
      setValue("description");
      setValue("quantity");
      setValue("stock");
      setValue("originalPrice");
      setValue("discount");
      setValue("barcode");
      setValue("productId");
      setValue("hsnCode", "");
      setValue("taxRate", 0);
      setValue("isPriceInclusive", false);
      setValue("discountType", "flat");
      setValue("gender", "");
      setValue("productType", "");
      setValue("metaTitle", "");
      setValue("metaDescription", "");
      setSeoImage("");
      setValue("status", "Published");
      setValue("lowStockAlert", 5);

      setProductId("");
      // setValue('show');
      setImageUrl([]);
      setFeaturedImage("");
      setHoverImage("");
      setBadge("");
      setVideo("");
      setThumbnailUrl("");
      setTag([]);
      setVariants([]);
      setVariant([]);
      setValues({});
      setTotalStock(0);
      setSelectedCategory([]);
      setDefaultCategory([]);
      setFaqSection({ enabled: false, icon: "", title: "", items: [] });
      if (location.pathname === "/products") {
        if (resetRefTwo?.current && typeof resetRefTwo.current.resetSelectedValues === "function") {
          resetRefTwo.current.resetSelectedValues();
        }
      }

      clearErrors("sku");
      clearErrors("title");
      clearErrors("slug");
      clearErrors("description");
      clearErrors("stock");
      clearErrors("quantity");
      setValue("stock", 0);
      setValue("costPrice", 0);
      setValue("discount", 0);
      setValue("originalPrice", 0);
      clearErrors("show");
      clearErrors("barcode");
      setIsCombination(false);
      setIsBasicComplete(false);
      setIsSubmitting(false);
      setAttributes([]);
      setBrand(null);
      
      // Reset New Sections
      setProductDescription({ enabled: true, icon: "", title: "Product Description", description: "" });
      setAdditionalInformation({ enabled: true, icon: "", title: "Additional Information", subsections: [] });
      setProductHighlights({ enabled: true, icon: "", title: "Product Highlights", items: [] });
      setManufacturerDetails({ enabled: true, icon: "", title: "Manufacturer Details", items: [] });
      setDisclaimer({ enabled: true, icon: "", title: "Disclaimer", description: "" });
      setFaqSection({ enabled: true, icon: "", title: "FAQ", items: [] });

      setUpdatedId();
      return;
    } else {
      handleProductTap("Basic Info", true);
    }

    if (id) {
      setIsBasicComplete(true);
      (async () => {
        try {
          const res = await ProductServices.getProductById(id);

          // console.log("res", res);

          if (res) {
            setResData(res);
            setSlug(res.slug);
            setUpdatedId(res._id);
            setValue("title", res.title[language ? language : "en"]);
            setValue(
              "description",
              res.description[language ? language : "en"]
            );
            setValue("slug", res.slug);
            setValue("show", res.show);
            setValue("sku", res.sku);
            setValue("barcode", res.barcode);
            setValue("stock", res.stock);
            setValue("productId", res.productId);
            setValue("discount", res?.prices?.discount);
            setValue("originalPrice", res?.prices?.originalPrice);
            setValue("stock", res.stock);
            setValue("hsnCode", res?.hsnCode || "");
            setValue(
              "taxRate",
              typeof res?.taxRate === "number"
                ? res.taxRate
                : Number(res?.taxRate || 0)
            );
            setValue("isPriceInclusive", Boolean(res?.isPriceInclusive));
            setValue("discountType", res?.prices?.discountType || "flat");
            setValue("gender", res.gender || "");
            setValue("productType", res.productType || "");
            setValue("metaTitle", res.metaTitle || "");
            setValue("metaDescription", res.metaDescription || "");
            setSeoImage(res.seoImage || "");
            setValue("status", mapStatusForForm(res.status));
            setValue("lowStockAlert", res.lowStockAlert || 5);

            setProductId(res.productId ? res.productId : res._id);
            setBarcode(res.barcode);
            setSku(res.sku);

            if (res.categories && Array.isArray(res.categories)) {
              res.categories.forEach((category) => {
                if (category) {
                  category.name = showingTranslateValue(category?.name, lang);
                }
              });
            }

            if (res.category) {
              res.category.name = showingTranslateValue(
                res?.category?.name,
                lang
              );
            }

            setSelectedCategory(res.categories || []);
            setDefaultCategory(res?.category ? [res?.category] : []);
            let parsedTagsTwo = [];
            try {
              parsedTagsTwo = typeof res.tag === "string" ? JSON.parse(res.tag) : (Array.isArray(res.tag) ? res.tag : [res.tag].filter(Boolean));
            } catch (e) {
              parsedTagsTwo = res.tag ? [res.tag] : [];
            }
            setTag(parsedTagsTwo);
            setImageUrl(res.image);
            setFeaturedImage(res.featuredImage || "");
            setHoverImage(res.hoverImage || "");
            setBadge(res.badge || "");
            setVideo(res.video || "");
            setThumbnailUrl(res.thumbnail || "");
            const normalizedVariants = ensureVariantsHaveSku(
              res.variants || [],
              res.sku || res.productId || res._id || "SKU"
            );
            setVariants(normalizedVariants);
            setIsCombination(res.isCombination);
            setQuantity(res?.stock);
            setTotalStock(res.stock);
            setOriginalPrice(res?.prices?.originalPrice);
            setPrice(res?.prices?.price);
            setValue("originalPrice", res?.prices?.originalPrice || 0);
            setValue("price", res?.prices?.price || 0);
            setValue("salePrice", res?.prices?.salePrice || 0);
            if (res?.brand) {
              setBrand(res.brand);
            } else {
              setBrand(null);
            }
            setDynamicSections(res.dynamicSections || []);
            setMediaSections(res.mediaSections || []);

            // Populate New Sections
            if (res.productDescription) setProductDescription({ ...res.productDescription, title: res.productDescription.title || "Product Description" });
            if (res.additionalInformation) setAdditionalInformation({ ...res.additionalInformation, title: res.additionalInformation.title || "Additional Information" });
            if (res.productHighlights) setProductHighlights({ ...res.productHighlights, title: res.productHighlights.title || "Product Highlights" });
            if (res.manufacturerDetails) setManufacturerDetails({ ...res.manufacturerDetails, title: res.manufacturerDetails.title || "Manufacturer Details" });
            if (res.disclaimer) setDisclaimer({ ...res.disclaimer, title: res.disclaimer.title || "Disclaimer" });
            if (res.faqs) setFaqSection({ ...res.faqs, title: res.faqs.title || "FAQ" });
          }
        } catch (err) {
          notifyError(err?.response?.data?.message || err?.message);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    id,
    setValue,
    isDrawerOpen,
    location.pathname,
    clearErrors,
    language,
    lang,
  ]);

  //for filter related attribute and extras for every product which need to update
  useEffect(() => {
    const result = attribue
      ?.filter((att) => att.option !== "Checkbox")
      .map((v) => {
        return {
          label: showingTranslateValue(v?.title, lang),
          value: showingTranslateValue(v?.title, lang),
        };
      });

    setAttTitle([...result]);

    const res = Object?.keys(Object.assign({}, ...variants));
    const varTitle = attribue?.filter((att) => res.includes(att._id));

    if (variants?.length > 0) {
      setTotalStock(sumVariantStock(variants));
    }
    setVariantTitle(varTitle);
  }, [attribue, variants, language, lang]);

  //for adding attribute values
  const handleAddAtt = (v, el) => {
    const result = attribue.filter((att) => {
      const attribueTItle = showingTranslateValue(att?.title, lang);
      return v.some((item) => item.label === attribueTItle);
    });

    const attributeArray = result.map((value) => {
      const attributeTitle = showingTranslateValue(value?.title, lang);
      return {
        ...value,
        label: attributeTitle,
        value: attributeTitle,
      };
    });

    setAttributes(attributeArray);
  };

  // Helper to check if a variant already exists (by comparing attribute values)
  const isVariantDuplicate = (newVariant, existingVariants) => {
    if (!existingVariants || existingVariants.length === 0) return false;
    
    // Extract only attribute keys (excluding price, quantity, etc.)
    const getAttributeKeys = (v) => {
      const { 
        originalPrice, discount, price, quantity, barcode, sku, productId, 
        image, images, video, title, description, slug, dynamicSections, 
        mediaSections, ...rest 
      } = v;
      return rest;
    };
    
    const newAttrs = getAttributeKeys(newVariant);
    // Sort keys for consistent comparison
    const sortedNewAttrs = Object.keys(newAttrs)
      .sort()
      .reduce((acc, key) => {
        acc[key] = newAttrs[key];
        return acc;
      }, {});
    const newAttrStr = JSON.stringify(sortedNewAttrs);
    
    return existingVariants.some((existing) => {
      const existingAttrs = getAttributeKeys(existing);
      const sortedExistingAttrs = Object.keys(existingAttrs)
        .sort()
        .reduce((acc, key) => {
          acc[key] = existingAttrs[key];
          return acc;
        }, {});
      return JSON.stringify(sortedExistingAttrs) === newAttrStr;
    });
  };

  //generate all combination combination - now shows preview with checkboxes
  const handleGenerateCombination = (isAuto = false) => {
    if (Object.keys(values).length === 0) {
      if (!isAuto) notifyError("Please select a variant first!");
      return;
    }

    const result = variants.filter(
      (v) => {
        const {
          originalPrice, discount, price, quantity, barcode, sku, productId, image, 
          title, description, slug, dynamicSections, mediaSections, ...rest
        } = v;
        return Object.keys(rest).length > 0;
      }
    );

    const combo = combinate(values);
    const baseSkuCode = sku || productId || "SKU";
    
    const finalVariants = combo.map((com, i) => {
      const existing = result.find(v => {
        const {
          originalPrice: op, discount: d, price: p, quantity: q, barcode: b, sku: s, productId: pi, image: img,
          title: t, description: desc, slug: sl, dynamicSections: ds, mediaSections: ms, ...rest
        } = v;
        const comboKeys = Object.keys(com).sort();
        const existingKeys = Object.keys(rest).sort();
        if (comboKeys.length !== existingKeys.length) return false;
        return comboKeys.every(key => com[key] === rest[key]);
      });

      if (existing) return existing;

      const variantIndex = result.length + i;
      return {
        ...com,
        originalPrice: getNumberTwo(originalPrice),
        price: getNumber(price),
        quantity: Number(quantity),
        discount: Number(originalPrice - price),
        productId: productId && productId + "-" + variantIndex,
        barcode: barcode,
        sku: generateVariantSku(baseSkuCode, variantIndex),
        image: imageUrl[0] || "",
      };
    });

    setVariants(finalVariants);
    setIsCombination(true);
    if (!isAuto) notifySuccess(`${finalVariants.length} variants generated!`);
  };
  // Helper to generate UUID (simple version)
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Helper to generate slug from title
  const generateSlug = (value = "") =>
    value
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // Helper to generate variant slug with UUID
  const generateVariantSlug = (productSlug, combinationLabel, existingSlug = "") => {
    const baseSlug = productSlug || "product";
    if (!combinationLabel || combinationLabel.trim() === "") {
      // If no combination, use main product slug
      return baseSlug;
    }
    
    // Extract UUID from existing slug if it exists, otherwise generate new one
    let uuid = "";
    if (existingSlug && existingSlug.includes("-")) {
      const parts = existingSlug.split("-");
      const lastPart = parts[parts.length - 1];
      // Check if last part looks like a UUID (8 chars, alphanumeric)
      if (lastPart && lastPart.length === 8 && /^[a-z0-9]+$/.test(lastPart)) {
        uuid = lastPart;
      }
    }
    
    // If no existing UUID found, generate new one
    if (!uuid) {
      uuid = generateUUID().substring(0, 8);
    }
    
    const combinationSlug = generateSlug(combinationLabel);
    return `${baseSlug}-${combinationSlug}-${uuid}`;
  };

  // Helper to build combination label from attributes
  const buildCombinationLabel = (variantData = {}) => {
    if (!Array.isArray(variantTitle) || variantTitle.length === 0) return "";

    const parts = [];
    variantTitle.forEach((attribute) => {
      const valueId = variantData[attribute._id];
      if (!valueId) return;

      const option = attribute?.variants?.find((opt) => opt._id === valueId);
      if (!option) return;

      const optionName =
        typeof option.name === "object"
          ? showingTranslateValue(option.name)
          : option.name;

      if (optionName && typeof optionName === "string") {
        parts.push(optionName);
      }
    });

    return parts.filter(Boolean).join(" ");
  };

  // Create only selected variants from preview
  const handleCreateSelectedVariants = () => {
    if (selectedPreviewVariants.length === 0) {
      return notifyError("Please select at least one variant to create!");
    }

    // Get current variants to check for duplicates
    const currentVariants = variants.filter(
      ({
        originalPrice,
        discount,
        price,
        quantity,
        barcode,
        sku,
        productId,
        image,
        ...rest
      }) => JSON.stringify({ ...rest }) !== "{}"
    );

    const variantsToAdd = previewVariants
      .filter((_, idx) => selectedPreviewVariants.includes(idx))
      .map((variant) => {
        // Auto-generate title, description, and slug
        const mainProductTitle = resData?.title?.[language] || "";
        const mainProductDescription = resData?.description?.[language] || "";
        const combinationLabel = buildCombinationLabel(variant);
        const productSlug = resData?.slug || slug || generateSlug(mainProductTitle);

        // Generate combination title: "Product Title - Attribute1 Attribute2"
        const autoTitle = combinationLabel
          ? `${mainProductTitle}${mainProductTitle ? " - " : ""}${combinationLabel}`
          : mainProductTitle || "";

        // Generate variant slug: product-slug-combination-name-uuid (or just product-slug if no combination)
        const autoSlug = generateVariantSlug(productSlug, combinationLabel);

        return {
          ...variant,
          title: {
            [language]: autoTitle,
          },
          description: {
            [language]: mainProductDescription || "",
          },
          slug: autoSlug,
        };
      })
      .filter((variant) => {
        // Double-check for duplicates before adding
        if (isVariantDuplicate(variant, currentVariants)) {
          const combinationLabel = buildCombinationLabel(variant);
          notifyError(
            `Variant "${combinationLabel || "Unknown"}" already exists and was skipped.`
          );
          return false;
        }
        return true;
      });

    if (variantsToAdd.length === 0) {
      return notifyError("No new variants to add. All selected variants already exist!");
    }

    // Add selected variants to existing variants
    setVariants((prev) => [...prev, ...variantsToAdd]);
    
    // Also add to variant array for tracking
    variantsToAdd.forEach((newCom) => {
      const { originalPrice, discount, price, quantity, barcode, sku, productId, image, title, description, slug, ...rest } = newCom;
      setVariant((pre) => [...pre, rest]);
    });

    // Reset preview state
    setPreviewVariants([]);
    setSelectedPreviewVariants([]);
    setShowPreviewModal(false);
    setValues({});

    // Reset attribute dropdowns
    if (resetRef?.current) {
      resetRef.current.forEach((ref) => {
        if (ref && typeof ref.resetSelectedValues === "function") {
          ref.resetSelectedValues();
        }
      });
    }

    const skippedCount = selectedPreviewVariants.length - variantsToAdd.length;
    if (skippedCount > 0) {
      notifySuccess(
        `${variantsToAdd.length} variant(s) created successfully! ${skippedCount} duplicate(s) skipped.`
      );
    } else {
      notifySuccess(`${variantsToAdd.length} variant(s) created successfully!`);
    }
  };

  // Toggle preview variant selection
  const handleTogglePreviewVariant = (index) => {
    setSelectedPreviewVariants((prev) => {
      if (prev.includes(index)) {
        return prev.filter((idx) => idx !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // Select all preview variants
  const handleSelectAllPreviewVariants = () => {
    if (selectedPreviewVariants.length === previewVariants.length) {
      setSelectedPreviewVariants([]);
    } else {
      setSelectedPreviewVariants(previewVariants.map((_, idx) => idx));
    }
  };

  //for clear selected combination
  const handleClearVariant = () => {
    setVariants([]);
    setVariant([]);
    setValues({});
    resetRef?.current?.map(
      async (v, i) => await resetRef?.current[i]?.resetSelectedValues()
    );

    // console.log('value', selectedList, removedItem, resetRef.current);
  };

  const handleUpdateVariant = async (index, updatedData = {}) => {
    if (!updatedId) {
      notifyError("Product ID is missing. Please save the product first.");
      return;
    }

    // Calculate updated variants first (before state update)
    const updatedVariants = variants.map((variant, idx) => {
      if (idx !== index) return variant;
      const merged = {
        ...variant,
      };

      if (updatedData.title) {
        merged.title = { ...(variant.title || {}), ...(updatedData.title || {}) };
      }

      if (updatedData.description) {
        merged.description = { ...(variant.description || {}), ...(updatedData.description || {}) };
      }

      if (updatedData.images) {
        merged.images = Array.isArray(updatedData.images) ? [...updatedData.images] : [];
        // Update image field (first image) for display
        merged.image = Array.isArray(updatedData.images) && updatedData.images.length > 0 
          ? updatedData.images[0] 
          : variant.image || "";
      }

      if (Object.prototype.hasOwnProperty.call(updatedData, "video")) {
        merged.video = updatedData.video || "";
      }

      if (updatedData.dynamicSections) {
        merged.dynamicSections = Array.isArray(updatedData.dynamicSections) 
          ? [...updatedData.dynamicSections] 
          : variant.dynamicSections || [];
      }

      if (updatedData.mediaSections) {
        merged.mediaSections = Array.isArray(updatedData.mediaSections) 
          ? [...updatedData.mediaSections] 
          : variant.mediaSections || [];
      }

      if (Object.prototype.hasOwnProperty.call(updatedData, "slug")) {
        merged.slug = updatedData.slug || "";
      }

      if (Object.prototype.hasOwnProperty.call(updatedData, "sku")) {
        merged.sku = updatedData.sku || "";
      }

      if (Object.prototype.hasOwnProperty.call(updatedData, "barcode")) {
        merged.barcode = updatedData.barcode || "";
      }

      if (Object.prototype.hasOwnProperty.call(updatedData, "productId")) {
        merged.productId = updatedData.productId || "";
      }

      if (
        Object.prototype.hasOwnProperty.call(updatedData, "originalPrice") ||
        Object.prototype.hasOwnProperty.call(updatedData, "price")
      ) {
        const updatedOriginalPrice =
          updatedData.originalPrice !== undefined
            ? Number(updatedData.originalPrice)
            : Number(variant.originalPrice || 0);
        const updatedPrice =
          updatedData.price !== undefined
            ? Number(updatedData.price)
            : Number(variant.price || 0);

        merged.originalPrice = updatedOriginalPrice;
        merged.price = updatedPrice;
        merged.discount = Number(updatedOriginalPrice) - Number(updatedPrice);
      }

      if (Object.prototype.hasOwnProperty.call(updatedData, "quantity")) {
        merged.quantity = Number(updatedData.quantity || 0);
      }

      return merged;
    });

    // Update local state
    setVariants(updatedVariants);

    // Update total stock after variant update
    const newTotalStock = updatedVariants.reduce(
      (pre, acc) => Number(pre) + Number(acc.quantity || 0),
      0
    );
    setTotalStock(Number(newTotalStock));

    // Prepare variants with proper formatting
    const formattedVariants = updatedVariants.map((v) => ({
      ...v,
      price: getNumberTwo(v?.price),
      originalPrice: getNumberTwo(v?.originalPrice),
      discount: getNumberTwo(v?.discount),
      quantity: Number(v?.quantity || 0),
    }));

    // Build variant filters
    const buildVariantFilters = (variantList) => {
      if (!isCombination || !variantList?.length) return [];
      return variantList.map((variant, idx) => {
        const attributeMap = {};
        const labelParts = [];
        variantTitle?.forEach((attribute) => {
          const valueId = variant[attribute._id];
          if (valueId) {
            attributeMap[attribute._id] = valueId;
            const option = attribute?.variants?.find(
              (opt) => opt._id === valueId
            );
            if (option) {
              const optionName =
                typeof option.name === "object"
                  ? showingTranslateValue(option.name)
                  : option.name;
              labelParts.push(optionName);
            }
          }
        });

        return {
          sku: variant.sku || generateVariantSku(resData?.sku || productId || "SKU", idx),
          barcode: variant.barcode || "",
          attributes: attributeMap,
          combinationLabel: labelParts.filter(Boolean).join(" "),
          price: variant.price,
          originalPrice: variant.originalPrice,
          quantity: variant.quantity,
        };
      });
    };

    const variantFiltersPayload = buildVariantFilters(formattedVariants);

    // Helper functions for sanitization
    const sanitizeDynamicSections = (sections) =>
      (sections || [])
        .filter((section) => section?.name?.trim())
        .map((section) => ({
          name: section.name.trim(),
          description: section.description || "",
          isVisible: section?.isVisible !== false,
          subsections: (section.subsections || [])
            .filter((subsection) => {
              if (!subsection) return false;
              if (subsection.type === "paragraph") {
                return Boolean(subsection.content?.trim());
              }
              return (
                Boolean(subsection.key?.trim()) ||
                Boolean(subsection.value?.trim())
              );
            })
            .map((subsection) => ({
              title: subsection.title || "",
              type: subsection.type === "paragraph" ? "paragraph" : "keyValue",
              key:
                subsection.type === "paragraph"
                  ? ""
                  : subsection.key?.trim() || "",
              value:
                subsection.type === "paragraph"
                  ? ""
                  : subsection.value?.trim() || "",
              content:
                subsection.type === "paragraph"
                  ? subsection.content || ""
                  : subsection.content || "",
              isVisible: subsection?.isVisible !== false,
            })),
        }));

    const sanitizeMediaSections = (sections) =>
      (sections || [])
        .filter((section) => section?.name?.trim())
        .map((section) => ({
          name: section.name.trim(),
          description: section.description || "",
          isVisible: section?.isVisible !== false,
          items: (section.items || [])
            .filter(
              (item) =>
                item?.image?.trim() &&
                item?.details?.trim()
            )
            .map((item) => ({
              image: item.image.trim(),
              details: item.details.trim(),
            })),
        }));

    const sanitizeFaqs = (faqList) =>
      (faqList || [])
        .filter((faq) => faq?.question?.trim())
        .map((faq) => {
          const answerType = ["yes", "no", "custom"].includes(
            (faq.answerType || "").toLowerCase()
          )
            ? faq.answerType.toLowerCase()
            : "yes";
          const customAnswer =
            answerType === "custom"
              ? (faq.customAnswer || faq.answer || "").trim()
              : "";
          const answer =
            answerType === "custom"
              ? customAnswer
              : answerType === "yes"
              ? "Yes"
              : "No";

          if (answerType === "custom" && !answer) {
            return null;
          }

          return {
            question: faq.question.trim(),
            answerType,
            answer,
            isVisible: faq?.isVisible !== false,
          };
        })
        .filter(Boolean);

    // Prepare product update payload
    const productUpdateData = {
      productId: resData?.productId || productId || "",
      sku: resData?.sku || sku || "",
      barcode: resData?.barcode || barcode || "",
      title: updatedData.productTitle || resData?.title || {},
      description: updatedData.productDescription || resData?.description || {},
      highlights: resData?.highlights || {},
      slug: resData?.slug || slug || "",
      categories: selectedCategory.map((item) => item._id),
      category: defaultCategory[0]?._id || resData?.category?._id || resData?.category || "",
      image: imageUrl,

      stock: formattedVariants?.length > 0 ? Number(totalStock) : resData?.stock || 0,
      tag: resData?.tag ? resData.tag : JSON.stringify(tag),
      prices: {
        price: getNumber(resData?.prices?.price || price || 0),
        originalPrice: getNumberTwo(resData?.prices?.originalPrice || originalPrice || 0),
        discount: Number(resData?.prices?.originalPrice || originalPrice || 0) - Number(resData?.prices?.price || price || 0),
      },
      isCombination: formattedVariants?.length > 0 ? isCombination : false,
      variants: formattedVariants,
      variantFilters: variantFiltersPayload,
      brand: brand?._id || resData?.brand?._id || null,
      dynamicSections: sanitizeDynamicSections(dynamicSections),
      mediaSections: sanitizeMediaSections(mediaSections),
      faqs: sanitizeFaqs(faqSection?.items || []),
    };

    // Call API to update product with new variants
    try {
      setIsSubmitting(true);
      const res = await ProductServices.updateProduct(updatedId, productUpdateData);
      if (res) {
        // Update resData with the response
        setResData(res.data || res);
        notifySuccess("Variant updated successfully!");
      }
    } catch (err) {
      console.error("Error updating variant:", err);
      notifyError(err?.response?.data?.message || err?.message || "Failed to update variant");
      // Revert local state on error - we could implement this if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  //for remove combination values
  const handleRemoveVariant = (vari, ext) => {
    // console.log("handleRemoveVariant", vari, ext);
    swal({
      title: `Are you sure to delete this ${ext ? "Extra" : "combination"}!`,
      text: `(If Okay, It will be delete this ${
        ext ? "Extra" : "combination"
      })`,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        const result = variants.filter((v) => v !== vari);
        setVariants(result);
        
        // Update total stock after removing variant
        const newTotalStock = result.reduce(
          (pre, acc) => Number(pre) + Number(acc.quantity || 0),
          0
        );
        setTotalStock(Number(newTotalStock));
        
        // console.log("result", result);
        const {
          originalPrice,
          price,
          discount,
          quantity,
          barcode,
          sku,
          productId,
          image,
          ...rest
        } = vari;
        const res = variant.filter(
          (obj) => JSON.stringify(obj) !== JSON.stringify(rest)
        );
        setVariant(res);
        setIsBulkUpdate(true);
        // setTimeout(() => setIsBulkUpdate(false), 500);
        const timeOutId = setTimeout(() => setIsBulkUpdate(false), 500);
        return clearTimeout(timeOutId);
      }
    });
  };

  // handle notification for combination and extras
  const handleIsCombination = () => {
    if ((isCombination && variantTitle.length) > 0) {
      swal({
        title: "Are you sure to remove combination from this product!",
        text: "(It will be delete all your combination and extras)",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((value) => {
        // console.log(value);
        if (value) {
          setIsCombination(!isCombination);
          setTapValue("Basic Info");
          setVariants([]);
          setVariant([]);
        }
      });
    } else {
      setIsCombination(!isCombination);
      setTapValue("Basic Info");
    }
  };

  //for select bulk action images
  const handleSelectImage = (img) => {
    if (openModal && imgId !== null && imgId !== undefined) {
      setVariants((prev) =>
        prev.map((variant, idx) => {
          if (idx === imgId) {
            return {
              ...variant,
              image: img,
              // Update images array if it exists, otherwise create it
              images: Array.isArray(variant.images) && variant.images.length > 0
                ? variant.images
                : img ? [img] : [],
            };
          }
          return variant;
        })
      );
      setOpenModal(false);
      setImgId("");
    }
  };

  //for select individual combination image
  const handleSelectInlineImage = (id) => {
    setImgId(id);
    setOpenModal(!openModal);
  };

  //this for variant/combination list
  const handleSkuBarcode = (value, name, id) => {
    setVariants((prev) =>
      prev.map((variant, idx) =>
        idx === id
          ? {
              ...variant,
              [name]: value,
            }
          : variant
      )
    );
  };

  const handleProductTap = (e, value, name) => {
    // console.log(e);

    if (value) {
      if (!value)
        return notifyError(
          `${"Please save product before adding combinations!"}`
        );
    } else {
      if (!isBasicComplete)
        return notifyError(
          `${"Please save product before adding combinations!"}`
        );
    }
    setTapValue(e);
  };

  //this one for combination list
  const handleQuantityPrice = (value, name, id, variant) => {
    // console.log(
    //   "handleQuantityPrice",
    //   "name",
    //   name,
    //   "value",
    //   value,
    //   "variant",
    //   variant
    // );
    if (name === "discount" && Number(value) > 100) {
      notifyError("Discount percentage cannot be more than 100!");
      setValue("discount", 0);
      setIsBulkUpdate(true);
      const timeOutId = setTimeout(() => setIsBulkUpdate(false), 100);
      return () => clearTimeout(timeOutId);
    }

    setVariants((pre) =>
      pre.map((com, i) => {
        if (i === id) {
          const updatedCom = {
            ...com,
            [name]: Math.round(value),
          };

          if (name === "discount") {
            updatedCom.discount = getNumberTwo(value);
            updatedCom.price = Number(variant.originalPrice) - (Number(variant.originalPrice) * Number(value) / 100);
          }
          if (name === "originalPrice") {
            updatedCom.originalPrice = getNumberTwo(value);
            updatedCom.price = Number(value) - (Number(value) * Number(variant.discount) / 100);
          }

          return updatedCom;
        }
        return com;
      })
    );

    const totalStock = variants.reduce(
      (pre, acc) => Number(pre) + Number(acc.quantity),
      0
    );
    setTotalStock(Number(totalStock));
  };

  //for change language in product drawer
  const handleSelectLanguage = (lang) => {
    setLanguage(lang);
    if (Object.keys(resData).length > 0) {
      setValue("title", resData.title[lang ? lang : "en"]);
      setValue("description", resData.description[lang ? lang : "en"]);
    }
  };

  //for handle product slug
  const handleProductSlug = (value) => {
    const newSlug = value.toLowerCase().replace(/[^A-Z0-9]+/gi, "-");
    setValue("slug", newSlug);
    setSlug(newSlug);
    
    // Update all variant slugs when product slug changes
    if (variants.length > 0 && isCombination) {
      setVariants((prevVariants) =>
        prevVariants.map((variant) => {
          // Extract combination label from variant
          const combinationLabel = buildCombinationLabel(variant);
          
          // If variant has no combination, use main product slug
          if (!combinationLabel || combinationLabel.trim() === "") {
            return {
              ...variant,
              slug: newSlug,
            };
          }
          
          // Regenerate variant slug with new product slug but keep existing UUID
          const existingSlug = variant.slug || "";
          const variantSlug = generateVariantSlug(newSlug, combinationLabel, existingSlug);
          
          return {
            ...variant,
            slug: variantSlug,
          };
        })
      );
    }
  };

  return {
    tag,
    setTag,
    values,
    language,
    register,
    onSubmit,
    errors,
    slug,
    openModal,
    attribue,
    setValues,
    variants,
    setVariants,
    imageUrl,
    setImageUrl,
    thumbnailUrl,
    setThumbnailUrl,
    handleSubmit,
    isCombination,
    variantTitle,
    attributes,
    setAttributes,
    attTitle,
    handleAddAtt,
    productId,
    onCloseModal,
    isBulkUpdate,
    isSubmitting,
    tapValue,
    setTapValue,
    resetRefTwo,
    handleSkuBarcode,
    handleProductTap,
    selectedCategory,
    setSelectedCategory,
    setDefaultCategory,
    defaultCategory,
    handleProductSlug,
    handleSelectLanguage,
    handleIsCombination,
    handleRemoveVariant,
    handleClearVariant,
    handleQuantityPrice,
    handleSelectImage,
    handleSelectInlineImage,
    handleGenerateCombination,
    watch,
    control,
    brand,
    setBrand,
    brandOptions: brandOptions || [],
    dynamicSections,
    setDynamicSections,
    mediaSections,
    setMediaSections,
    handleUpdateVariant,
    resData,
    setValue,
    previewVariants,
    selectedPreviewVariants,
    showPreviewModal,
    setShowPreviewModal,
    handleCreateSelectedVariants,
    handleTogglePreviewVariant,
    handleSelectAllPreviewVariants,
    
    // New Sections Exports
    productDescription, setProductDescription,
    additionalInformation, setAdditionalInformation,
    productHighlights, setProductHighlights,
    manufacturerDetails, setManufacturerDetails,
    disclaimer, setDisclaimer,
    faqSection, setFaqSection,
    seoImage, setSeoImage,

    featuredImage, setFeaturedImage,
    hoverImage, setHoverImage,
    badge, setBadge,
    video, setVideo,
  };
};

export default useProductSubmit;
