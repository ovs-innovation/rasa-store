import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  FiChevronRight,
  FiMinus,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
  FiShare2,
  FiHeart,
  FiShuffle,
} from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import { FaInstagram } from "react-icons/fa";
//internal import

import Price from "@components/common/Price";
import Stock from "@components/common/Stock";
import Tags from "@components/common/Tags";
import Layout from "@layout/Layout";
import Card from "@components/slug-card/Card";
import useAddToCart from "@hooks/useAddToCart";
import { useCart } from "react-use-cart";
import Loading from "@components/preloader/Loading";
import VariantList from "@components/variants/VariantList";
import ColorImagePicker from "@components/variants/ColorImagePicker";
import { SidebarContext } from "@context/SidebarContext";
import { UserContext } from "@context/UserContext";
import AttributeServices from "@services/AttributeServices";
import ProductServices from "@services/ProductServices";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useGetSetting from "@hooks/useGetSetting";
import ProductImageGallery from "@components/product/ProductImageGallery";
import ProductDetailsSection from "@components/product/ProductDetailsSection";
import RelatedProductsSection from "@components/product/RelatedProductsSection";
import LocationPickerDropdown from "@components/location/LocationPickerDropdown";
import RatingSummary from "@components/reviews/RatingSummary";
import ReviewFilters from "@components/reviews/ReviewFilters";
import ReviewList from "@components/reviews/ReviewList";
import WriteReviewForm from "@components/reviews/WriteReviewForm";
import ReviewServices from "@services/ReviewServices";
import { notifyError, notifySuccess } from "@utils/toast";
import { useSession } from "next-auth/react";
import { addToWishlist } from "@lib/wishlist";
import { getExpectedDeliveryTime } from "@utils/deliveryTime";
import CustomerServices from "@services/CustomerServices";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import SuggestedProducts from "@components/product/SuggestedProducts";
import { UK_SIZE_RANGES } from "@utils/fashionMap";

const ProductScreen = ({ product, attributes, relatedProducts }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { state: userState } = useContext(UserContext) || {};

  // Get user info from session, context, or cookies
  const cookieUserInfo = (typeof window !== "undefined") ? (() => {
    try { const c = Cookies.get("userInfo"); return c ? JSON.parse(c) : null; } catch (e) { return null; }
  })() : null;

  const sessionRole = session?.user?.role;
  const contextRole = userState?.userInfo?.role;
  const cookieRole = cookieUserInfo?.role;
  const userRole = sessionRole || contextRole || cookieRole || null;

  // also expose a userInfo object for other usages (cookies/context/session)
  const userInfo = session?.user || userState?.userInfo || cookieUserInfo || null;

  const { lang, showingTranslateValue, getNumber, currency, getNumberTwo } =
    useUtilsFunction();
  const { isLoading, setIsLoading } = useContext(SidebarContext);
  const { handleAddItem, item, setItem } = useAddToCart();
  const { setItems, addItem } = useCart();
  const { storeCustomizationSetting, globalSetting } = useGetSetting();

  // Handle Product View Tracking
  useEffect(() => {
    if (product?._id) {
       // 1. Backend Tracking (fire and forget)
       ProductServices.addProductView({ productId: product._id }).catch(err => 
         console.error("Tracking view failed", err)
       );

       // 2. Guest LocalStorage Tracking
       if (!session?.user && typeof window !== "undefined") {
          try {
             let history = [];
             const stored = localStorage.getItem("recentlyViewed");
             if (stored) history = JSON.parse(stored);
             
             // Remove if exists (to move to top)
             history = history.filter(p => p._id !== product._id);
             
             // Add current
             history.unshift({
               _id: product._id,
               viewedAt: Date.now()
             });
             
             // Limit to 10
             if(history.length > 10) history = history.slice(0, 10);
             
             localStorage.setItem("recentlyViewed", JSON.stringify(history));
          } catch(e) {
             console.error("LS Error", e);
          }
       }
    }
  }, [product, session]);

  // react hook

  const [value, setValue] = useState("");
  const [price, setPrice] = useState(0);
  const [activeImage, setActiveImage] = useState("");
  const [originalPrice, setOriginalPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [selectVariant, setSelectVariant] = useState({});
  const [isReadMore, setIsReadMore] = useState(true);
  const [selectVa, setSelectVa] = useState({});
  const [variantTitle, setVariantTitle] = useState([]);
  const [variants, setVariants] = useState([]);
  const [dynamicTitle, setDynamicTitle] = useState("");
  const [dynamicDescription, setDynamicDescription] = useState("");
  const [variantDynamicSections, setVariantDynamicSections] = useState(null);
  const [variantMediaSections, setVariantMediaSections] = useState(null);
  const isUpdatingUrlRef = useRef(false);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsHasMore, setReviewsHasMore] = useState(false);
  const [reviewsSort, setReviewsSort] = useState("newest");
  const [reviewsRatingFilter, setReviewsRatingFilter] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [showStickyBottomBar, setShowStickyBottomBar] = useState(false);
  const [expectedDeliveryTime, setExpectedDeliveryTime] = useState(null);

  // Fetch shipping address if user is logged in
  const { data: shippingAddressData } = useQuery({
    queryKey: ["shippingAddress", { id: userInfo?.id }],
    queryFn: async () =>
      await CustomerServices.getShippingAddress({
        userId: userInfo?.id,
      }),
    select: (data) => data?.shippingAddress,
    enabled: !!userInfo?.id,
  });

  // Simple stock derivation to avoid infinite variant loops
  useEffect(() => {
    if (!product) return;

    if (Array.isArray(product.variants) && product.variants.length > 0) {
      // sum of variant quantities as overall stock
      const total = product.variants.reduce(
        (sum, v) => sum + (Number(v.quantity) || 0),
        0
      );
      setStock(total);
    } else {
      setStock(Number(product.stock) || 0);
    }
  }, [product]);

  // Get product media (images + optional video) - supports up to 5 items
  const productImages = useMemo(() => {
    const media = [];
    const seen = new Set();
    const pushUnique = (url) => {
      if (url && typeof url === "string" && url.trim() !== "" && !seen.has(url)) {
        seen.add(url);
        media.push(url);
      }
    };
    pushUnique(product?.featuredImage);
    if (Array.isArray(product?.image)) {
      product.image.forEach((img) => pushUnique(img));
    } else if (product?.image) {
      pushUnique(product.image);
    }

    // If legacy 'video' field exists, also push it into media array
    if (
      product?.video &&
      typeof product.video === "string" &&
      product.video.trim() !== ""
    ) {
      media.push(product.video);
    }

    return media.slice(0, 6);
  }, [product?.image, product?.video, product?.featuredImage]);

  const colorOptions = useMemo(() => {
    const apiColors = Array.isArray(product?.colorVariants)
      ? product.colorVariants
      : [];

    if (apiColors.length > 0) {
      return apiColors.map((cv, idx) => {
        const color = String(cv.color || `Color ${idx + 1}`).trim();
        const images = Array.isArray(cv.images)
          ? cv.images.filter((img) => typeof img === "string" && img.trim())
          : [];
        const image =
          cv.thumbnail ||
          images.find(Boolean) ||
          productImages[0] ||
          "";

        const hasStock =
          typeof cv.hasStock === "boolean"
            ? cv.hasStock
            : (product?.variants || []).some(
                (v) =>
                  String(v.color || v.colorName || "").trim() === color &&
                  Number(v.quantity) > 0
              );

        return { color, label: color, image, images, hasStock };
      });
    }

    if (!product?.variants?.length) return [];

    const map = new Map();

    const pushOption = (color, image, images, hasStock) => {
      const key = String(color || image || "").trim();
      if (!key || map.has(key)) return;
      map.set(key, {
        color: color || key,
        label: color || "Color",
        image: image || "",
        images: images || [],
        hasStock: Boolean(hasStock),
      });
    };

    const isNested = product.variants.some(
      (v) => v && (Array.isArray(v.sizes) || v.sizes)
    );

    if (isNested) {
      product.variants.forEach((colorVar, idx) => {
        const color = String(
          colorVar.color || colorVar.colorName || `Color ${idx + 1}`
        ).trim();
        const images = Array.isArray(colorVar.images)
          ? colorVar.images.filter((img) => typeof img === "string" && img.trim())
          : [];
        const image =
          colorVar.thumbnail || images.find(Boolean) || productImages[0] || "";
        const hasStock = (colorVar.sizes || []).some(
          (s) => Number(s.quantity ?? s.stock ?? 0) > 0
        );
        pushOption(color, image, images, hasStock);
      });
      return Array.from(map.values());
    }

    product.variants.forEach((variant) => {
      const color = String(
        variant.color ||
          variant.colorName ||
          String(variant.combinationLabel || "").split("/")[0]?.trim() ||
          ""
      ).trim();
      if (!color || map.has(color)) return;

      const images = Array.isArray(variant.images)
        ? variant.images.filter((img) => typeof img === "string" && img.trim())
        : [];
      const image =
        variant.thumbnail ||
        images.find(Boolean) ||
        productImages[0] ||
        "";

      const hasStock = product.variants.some((v) => {
        const vColor = String(v.color || v.colorName || "").trim();
        return vColor === color && Number(v.quantity) > 0;
      });

      pushOption(color, image, images, hasStock);
    });

    return Array.from(map.values());
  }, [product?.colorVariants, product?.variants, productImages]);

  const galleryImages = useMemo(() => {
    const seen = new Set();
    const list = [];
    const push = (url) => {
      if (url && typeof url === "string" && url.trim() !== "" && !seen.has(url)) {
        seen.add(url);
        list.push(url);
      }
    };

    const selectedColorName = String(
      selectVariant?.color || selectVariant?.colorName || selectVa?.color || ""
    )
      .trim()
      .toLowerCase();

    const selectedColorOption = colorOptions.find(
      (opt) => String(opt.color || "").trim().toLowerCase() === selectedColorName
    );

    if (selectedColorOption?.images?.length) {
      selectedColorOption.images.forEach(push);
    }
    push(selectedColorOption?.image);

    const variant = selectVariant;
    if (variant && Object.keys(variant).length > 0) {
      if (Array.isArray(variant.images)) {
        variant.images.forEach(push);
      }
      push(variant.image);
      push(variant.thumbnail);
      if (
        variant.video &&
        typeof variant.video === "string" &&
        variant.video.trim() !== ""
      ) {
        push(variant.video);
      }
    }

    if (list.length > 0) return list;

    productImages.forEach(push);
    return list.length > 0 ? list : productImages;
  }, [selectVariant, selectVa?.color, colorOptions, productImages]);

  const showColorPicker = colorOptions.length > 0;

  const selectableAttributeKeys = useMemo(() => {
    const sizeKeys = (variantTitle || []).map((a) => a._id);
    return showColorPicker ? ["color", ...sizeKeys] : sizeKeys;
  }, [variantTitle, showColorPicker]);

  const displayOriginalPrice = useMemo(() => {
    if (originalPrice > 0) return originalPrice;
    const variantOriginal = getNumber(product?.variants?.[0]?.originalPrice ?? 0);
    if (variantOriginal > 0) return variantOriginal;
    return getNumber(
      product?.prices?.originalPrice ?? product?.prices?.price ?? 0
    );
  }, [originalPrice, product, getNumber]);

  const displayRelatedProducts = useMemo(() => {
    const currentId = product?._id;
    if (!currentId) return [];
    const seen = new Set();
    return (relatedProducts || [])
      .filter((p) => {
        if (!p?._id || p._id === currentId || seen.has(p._id)) return false;
        seen.add(p._id);
        return true;
      })
      .slice(0, 12);
  }, [relatedProducts, product?._id]);

  // Keep a sharable URL in sync with current selection (includes query params)
  useEffect(() => {
    if (!router.isReady) return;
    if (typeof window === "undefined") return;

    // Always take the real browser URL so that we include query params
    setShareUrl(window.location.href);
  }, [router.isReady, router.asPath]);

  // Auto-select first available variant on initial load
  useEffect(() => {
    if (!product?.variants || product.variants.length === 0) return;
    if (!selectableAttributeKeys || selectableAttributeKeys.length === 0) return;

    // If we already have any attribute selected, don't override
    if (
      selectVa &&
      selectableAttributeKeys.some((key) => selectVa[key])
    ) {
      return;
    }

    // Pick first variant with stock > 0, otherwise just first variant
    const firstAvailableVariant =
      product.variants.find((v) => Number(v.quantity) > 0) ||
      product.variants[0];

    if (!firstAvailableVariant) return;

    const initialSelection = {};
    selectableAttributeKeys.forEach((key) => {
      if (firstAvailableVariant[key]) {
        initialSelection[key] = firstAvailableVariant[key];
      }
    });

    if (Object.keys(initialSelection).length === 0) return;

    // Initialize attribute selection; price/images/stock will be synced
    // by the variant-matching effect below.
    setSelectVa(initialSelection);
    setSelectVariant((prev) =>
      Object.keys(prev || {}).length === 0 ? firstAvailableVariant : prev
    );
  }, [product?.variants, selectableAttributeKeys]);

  // Auto-select first color swatch when product has color images
  useEffect(() => {
    if (!showColorPicker || colorOptions.length === 0) return;
    const currentColor =
      selectVa?.color || selectVariant?.color || selectVariant?.colorName;
    if (currentColor) return;

    const first = colorOptions[0];
    if (!first?.color) return;

    const match =
      product.variants.find(
        (v) =>
          (v.color === first.color || v.colorName === first.color) &&
          Number(v.quantity) > 0
      ) ||
      product.variants.find(
        (v) => v.color === first.color || v.colorName === first.color
      ) ||
      product.variants[0];

    if (match) {
      setSelectVa((prev) => ({
        ...prev,
        color: match.color || match.colorName || first.color,
        ...(match.size ? { size: match.size } : {}),
      }));
      setSelectVariant(match);
    }
  }, [showColorPicker, colorOptions, product?.variants, selectVa?.color, selectVariant?.color, selectVariant?.colorName]);

  useEffect(() => {
    // Trigger when we have variants and some selection
    if (!product?.variants || product.variants.length === 0) return;
    
    // Check if we have any attribute selection
    const attributeKeys = selectableAttributeKeys;
    const hasSelection = value || (selectVa && Object.keys(selectVa).length > 0 && attributeKeys.some(key => selectVa[key]));
    
    if (!hasSelection) {
      return;
    }
    
    if (hasSelection) {
      // Merge current selectVa with selectVariant to get complete selection
      const mergedSelection = { ...selectVariant, ...selectVa };
      
      // If we have attribute keys, filter by them; otherwise use all variants
      let result = product?.variants || [];
      
      if (attributeKeys.length > 0) {
        result = product?.variants?.filter((variant) => {
          // Check if variant matches all selected attributes
          return attributeKeys.every((attrKey) => {
            const selectedValue = mergedSelection[attrKey];
            // If no selection for this attribute, skip it (allow any value)
            if (!selectedValue) return true;
            return variant[attrKey] === selectedValue;
          });
        }) || [];
      }

      const res = result?.map(
        ({
          originalPrice,
          price,
          discount,
          quantity,
          barcode,
          sku,
          productId,
          image,
          images,
          title,
          description,
          ...rest
        }) => ({ ...rest })
      );

      const filterKey = Object.keys(Object.assign({}, ...res));
      const selectVar = filterKey?.reduce(
        (obj, key) => ({ ...obj, [key]: mergedSelection[key] || selectVariant[key] }),
        {}
      );
      const newObj = Object.entries(selectVar).reduce(
        (a, [k, v]) => (v ? ((a[k] = v), a) : a),
        {}
      );

      // Find the variant that matches all selected attributes
      let result2 = null;
      
      if (Object.keys(newObj).length > 0) {
        result2 = result?.find((v) =>
          Object.keys(newObj).every((k) => newObj[k] === v[k])
        );
      } else if (result.length > 0) {
        // If no specific selection, use first matching variant
        result2 = result[0];
      }

      // console.log("result2", result2);
      if (result.length <= 0 || result2 === undefined || result2 === null) {
        // If no exact match, try to find partial match
        if (result.length > 0) {
          result2 = result[0];
        } else {
          setStock(0);
          return;
        }
      }

      setVariants(result);
      const sameVariant =
        result2 && selectVariant && result2._id === selectVariant._id;
      if (!sameVariant) {
        setSelectVariant(result2);
        setSelectVa(result2);
      }
      
      // Get variant images - prioritize variant images
      let variantImages = [];
      if (Array.isArray(result2?.images) && result2.images.length > 0) {
        variantImages = result2.images;
      } else if (result2?.image) {
        variantImages = [result2.image];
      }
      
      // If variant has video, add it to images array
      if (result2?.video && typeof result2.video === "string" && result2.video.trim() !== "") {
        if (!variantImages.includes(result2.video)) {
          variantImages.push(result2.video);
        }
      }
      
      const combinedImages =
        variantImages.length > 0 ? variantImages : [...productImages];
      const variantImage = combinedImages[0] || productImages[0] || "";
      setActiveImage(variantImage);
      
      setStock(result2?.quantity);
      const price = getNumber(result2?.price);
      const originalPrice = getNumber(result2?.originalPrice);
      
      // Use actual discount percentage from database (variant discount)
      // Check variant discount first, then fallback to product discount
      const variantDiscount = getNumber(result2?.discount ?? result2?.prices?.discount ?? null);
      const productDiscount = getNumber(product?.prices?.discount ?? 0);
      // Use variant discount if available, otherwise use product discount
      const discount = variantDiscount !== null && variantDiscount !== undefined ? variantDiscount : productDiscount;
      
      console.log("Discount Debug (result2):", {
        result2: result2,
        result2Discount: result2?.discount,
        result2PricesDiscount: result2?.prices?.discount,
        variantDiscount,
        productDiscount,
        productPricesDiscount: product?.prices?.discount,
        finalDiscount: discount
      });
      
      setDiscount(discount);
      console.log("Discount state set to:", discount);
      setPrice(price);
      setOriginalPrice(originalPrice);
      
      // Set dynamic title and description - variant first, then product
      const variantTitleText = showingTranslateValue(result2?.title);
      const variantDescText = showingTranslateValue(result2?.description);
      setDynamicTitle(variantTitleText || showingTranslateValue(product?.title));
      setDynamicDescription(variantDescText || showingTranslateValue(product?.description));
      
      // Set variant-specific dynamic and media sections
      // Always set if array exists, even if sections have isVisible: false
      setVariantDynamicSections(
        Array.isArray(result2?.dynamicSections) && result2.dynamicSections.length > 0
          ? result2.dynamicSections
          : null
      );
      setVariantMediaSections(
        Array.isArray(result2?.mediaSections) && result2.mediaSections.length > 0
          ? result2.mediaSections
          : null
      );
    } else if (product?.variants?.length > 0) {
      const result = product?.variants?.filter((variant) =>
        Object.keys(selectVa).every((k) => selectVa[k] === variant[k])
      );

      setVariants(result);

      // Pick first variant with non-zero price, fall back to index 0
      const pricedVariant =
        product.variants.find(
          (v) => getNumber(v?.price ?? 0) > 0
        ) || product.variants[0];

      setStock(pricedVariant?.quantity);
      setSelectVariant(pricedVariant);
      setSelectVa(pricedVariant);

      // Get variant image - handle both variant.image (string) and variant.images (array)
      const firstVariantImageArr =
        Array.isArray(pricedVariant?.images) && pricedVariant.images.length > 0
          ? pricedVariant.images
          : pricedVariant?.image
          ? [pricedVariant.image]
          : [];

      const firstVariantImage =
        firstVariantImageArr[0] || productImages[0] || "";
      setActiveImage(firstVariantImage);

      const rawVariantPrice =
        pricedVariant?.price ?? product?.prices?.price ?? 0;
      const rawVariantOriginal =
        pricedVariant?.originalPrice ??
        product?.prices?.originalPrice ??
        rawVariantPrice;

      const price = getNumber(rawVariantPrice);
      const originalPrice = getNumber(rawVariantOriginal);
      
      // Use actual discount percentage from database (variant or product discount)
      const variantDiscount = getNumber(pricedVariant?.discount ?? pricedVariant?.prices?.discount ?? null);
      const productDiscount = getNumber(product?.prices?.discount ?? 0);
      // Use variant discount if available, otherwise use product discount
      const discount = variantDiscount !== null && variantDiscount !== undefined ? variantDiscount : productDiscount;
      
      console.log("Discount Debug (pricedVariant):", {
        pricedVariantDiscount: pricedVariant?.discount,
        pricedVariantPricesDiscount: pricedVariant?.prices?.discount,
        variantDiscount,
        productDiscount,
        finalDiscount: discount
      });
      
      setDiscount(discount);
      setPrice(price);
      setOriginalPrice(originalPrice);

      // Set dynamic title and description - variant first, then product
      const firstVariantTitleText = showingTranslateValue(pricedVariant?.title);
      const firstVariantDescText = showingTranslateValue(
        pricedVariant?.description
      );
      setDynamicTitle(
        firstVariantTitleText || showingTranslateValue(product?.title)
      );
      setDynamicDescription(
        firstVariantDescText || showingTranslateValue(product?.description)
      );

      // Set variant-specific dynamic and media sections
      setVariantDynamicSections(
        Array.isArray(pricedVariant?.dynamicSections) &&
          pricedVariant.dynamicSections.length > 0
          ? pricedVariant.dynamicSections
          : null
      );
      setVariantMediaSections(
        Array.isArray(pricedVariant?.mediaSections) &&
          pricedVariant.mediaSections.length > 0
          ? pricedVariant.mediaSections
          : null
      );
    } else {
      setStock(product?.stock);
      setActiveImage(productImages[0] || "");

      const baseRawPrice = product?.prices?.price ?? 0;
      const baseRawOriginal =
        product?.prices?.originalPrice ?? baseRawPrice;

      const price = getNumber(baseRawPrice);
      const originalPrice = getNumber(baseRawOriginal);
      
      // Use actual discount percentage from database (product discount)
      const discount = getNumber(product?.prices?.discount ?? 0);
      
      console.log("Discount Debug (no variant):", {
        productPricesDiscount: product?.prices?.discount,
        finalDiscount: discount
      });
      
      setDiscount(discount);
      setPrice(price);
      setOriginalPrice(originalPrice);
      
      // Set dynamic title and description - use product title/description when no variant
      setDynamicTitle(showingTranslateValue(product?.title));
      setDynamicDescription(showingTranslateValue(product?.description));
      
      // Reset variant-specific sections when no variant
      setVariantDynamicSections(null);
      setVariantMediaSections(null);
    }
  }, [
    product?.prices?.discount,
    product?.prices?.originalPrice,
    product?.prices?.price,
    product?.stock,
    product.variants,
    selectVa,
    selectVariant,
    value,
    productImages,
    selectableAttributeKeys,
    showingTranslateValue,
    getNumber,
    product?.title,
    product?.description,
  ]);

  useEffect(() => {
    const initialImage = productImages[0] || "";
    setActiveImage(initialImage);
    if (!dynamicTitle) {
      setDynamicTitle(showingTranslateValue(product?.title));
    }
    if (!dynamicDescription) {
      setDynamicDescription(showingTranslateValue(product?.description));
    }
  }, [productImages]);

  // Calculate expected delivery time
  useEffect(() => {
    const calculateDelivery = async () => {
      try {
        console.log("Calculating delivery time...", {
          hasGlobalSetting: !!globalSetting,
          hasShippingAddress: !!shippingAddressData,
          globalSetting: globalSetting ? {
            hasAddress: !!globalSetting.address,
            hasPostCode: !!globalSetting.post_code
          } : null
        });

        const deliveryTime = await getExpectedDeliveryTime(
          globalSetting,
          shippingAddressData
        );
        
        console.log("Delivery time result:", deliveryTime);
        setExpectedDeliveryTime(deliveryTime);
      } catch (error) {
        console.error("Error calculating delivery time:", error);
        // Set to null on error so we show the location picker
        setExpectedDeliveryTime(null);
      }
    };

    calculateDelivery();

    const handleLocationUpdate = () => {
      console.log("Location updated event received, recalculating delivery time...");
      calculateDelivery();
    };

    if (typeof window !== "undefined") {
      window.addEventListener('locationUpdated', handleLocationUpdate);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener('locationUpdated', handleLocationUpdate);
      }
    };
  }, [globalSetting, shippingAddressData]);

  // Fetch reviews when product or filters change
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?._id) return;
      try {
        setReviewsLoading(true);
        const res = await ReviewServices.getProductReviews({
          productId: product._id,
          sort: reviewsSort,
          rating: reviewsRatingFilter,
          page: 1,
          limit: 6,
        });
        setReviews(res.reviews || []);
        setRatingSummary(res.ratingSummary || null);
        setReviewsPage(1);
        setReviewsHasMore(
          res.pagination && res.pagination.page < res.pagination.pages
        );
      } catch (err) {
        notifyError(
          err?.response?.data?.message || "Failed to load reviews."
        );
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [product?._id, reviewsSort, reviewsRatingFilter]);

  const handleLoadMoreReviews = async () => {
    if (!product?._id || !reviewsHasMore || reviewsLoading) return;
    try {
      const nextPage = reviewsPage + 1;
      setReviewsLoading(true);
      const res = await ReviewServices.getProductReviews({
        productId: product._id,
        sort: reviewsSort,
        rating: reviewsRatingFilter,
        page: nextPage,
        limit: 6,
      });
      setReviews((prev) => [...prev, ...(res.reviews || [])]);
      setReviewsPage(nextPage);
      setReviewsHasMore(
        res.pagination && res.pagination.page < res.pagination.pages
      );
    } catch (err) {
      notifyError(
        err?.response?.data?.message || "Failed to load more reviews."
      );
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async ({ productId, rating, reviewText }) => {
    if (!productId) return;
    try {
      setReviewSubmitting(true);
      const res = await ReviewServices.addOrUpdateReview({
        productId,
        rating,
        reviewText,
      });

      if (res.review) {
        setReviews((prev) => {
          const idx = prev.findIndex((r) => r._id === res.review._id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = res.review;
            return updated;
          }
          return [res.review, ...prev];
        });
      }
      if (res.ratingSummary) {
        setRatingSummary(res.ratingSummary);
      }
    } catch (err) {
      notifyError(
        err?.response?.data?.message || "Failed to submit review."
      );
      throw err;
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleMarkHelpful = async (review) => {
    if (!review?._id) return;
    try {
      const res = await ReviewServices.markHelpful(review._id);
      if (res.review) {
        setReviews((prev) =>
          prev.map((r) => (r._id === res.review._id ? res.review : r))
        );
      }
    } catch (err) {
      notifyError(
        err?.response?.data?.message || "Failed to mark as helpful."
      );
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!reviewId) return;
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await ReviewServices.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      notifySuccess("Review deleted successfully.");
      // If we deleted the only review by the current user, it will disappear from existingReview too
    } catch (err) {
      notifyError(
        err?.response?.data?.message || "Failed to delete review."
      );
    }
  };

  // Additional useEffect to handle variant changes when selectVa changes (for immediate updates on button click)
  useEffect(() => {
    // Only trigger if we have variants
    if (!product?.variants || product.variants.length === 0) return;
    
    // Get attribute keys (size + color when picture picker is shown)
    const attributeKeys = selectableAttributeKeys;
    if (attributeKeys.length === 0) return;
    
    // Check if selectVa has any attribute selections
    const hasAttributeSelection = selectVa && Object.keys(selectVa).some(key => attributeKeys.includes(key));
    
    if (!hasAttributeSelection) return;
    
    // Find matching variant based on selected attributes
    const matchingVariant = product.variants.find((variant) => {
      return attributeKeys.every((attrKey) => {
        const selectedValue = selectVa[attrKey];
        // If attribute is selected, it must match; if not selected, allow any value
        if (!selectedValue) return true;
        return variant[attrKey] === selectedValue;
      });
    });

    // Compare by SKU or by checking if attributes match
    const isDifferent = !selectVariant || 
      matchingVariant?.sku !== selectVariant?.sku ||
      attributeKeys.some(key => matchingVariant[key] !== selectVariant[key]);
    
    if (matchingVariant && isDifferent) {
      setSelectVariant(matchingVariant);
      
      // Update images immediately - prioritize variant images
      let variantImages = [];
      if (Array.isArray(matchingVariant?.images) && matchingVariant.images.length > 0) {
        variantImages = matchingVariant.images;
      } else if (matchingVariant?.image) {
        variantImages = [matchingVariant.image];
      }
      
      // If variant has video, add it to images array
      if (matchingVariant?.video && typeof matchingVariant.video === "string" && matchingVariant.video.trim() !== "") {
        if (!variantImages.includes(matchingVariant.video)) {
          variantImages.push(matchingVariant.video);
        }
      }
      
      const combinedImages =
        variantImages.length > 0 ? variantImages : [...productImages];
      const variantImage = combinedImages[0] || productImages[0] || "";
      setActiveImage(variantImage);
      
      // Update price, stock, etc. immediately
      setStock(matchingVariant?.quantity || 0);
      const price = getNumber(matchingVariant?.price);
      const originalPrice = getNumber(matchingVariant?.originalPrice);
      
      // Use actual discount percentage from database (variant discount)
      const variantDiscount = getNumber(matchingVariant?.discount ?? matchingVariant?.prices?.discount ?? null);
      const productDiscount = getNumber(product?.prices?.discount ?? 0);
      // Use variant discount if available, otherwise use product discount
      const discount = variantDiscount !== null && variantDiscount !== undefined ? variantDiscount : productDiscount;
      
      setDiscount(discount);
      setPrice(price);
      setOriginalPrice(originalPrice);
      
      // Update dynamic title and description immediately
      const variantTitleText = showingTranslateValue(matchingVariant?.title);
      const variantDescText = showingTranslateValue(matchingVariant?.description);
      setDynamicTitle(variantTitleText || showingTranslateValue(product?.title));
      setDynamicDescription(variantDescText || showingTranslateValue(product?.description));
      
      // Update variant-specific dynamic and media sections immediately
      // Always set if array exists, even if sections have isVisible: false
      setVariantDynamicSections(
        Array.isArray(matchingVariant?.dynamicSections) && matchingVariant.dynamicSections.length > 0
          ? matchingVariant.dynamicSections
          : null
      );
      setVariantMediaSections(
        Array.isArray(matchingVariant?.mediaSections) && matchingVariant.mediaSections.length > 0
          ? matchingVariant.mediaSections
          : null
      );
    }
  }, [selectVa, selectableAttributeKeys, product?.variants, productImages, showingTranslateValue, getNumber, product?.title, product?.description, selectVariant]);

  const handleColorSelect = (colorValue) => {
    if (!product?.variants?.length) return;

    const targetColor = String(colorValue || "").trim().toLowerCase();

    const matchesColor = (v) => {
      const vColor = String(v.color || v.colorName || "").trim().toLowerCase();
      return vColor === targetColor;
    };

    const currentSize = selectVa?.size || selectVariant?.size;
    let match = null;

    if (currentSize) {
      match =
        product.variants.find(
          (v) => matchesColor(v) && v.size === currentSize && Number(v.quantity) > 0
        ) ||
        product.variants.find(
          (v) => matchesColor(v) && v.size === currentSize
        );
    }

    if (!match) {
      match =
        product.variants.find(
          (v) => matchesColor(v) && Number(v.quantity) > 0
        ) || product.variants.find((v) => matchesColor(v));
    }

    const resolvedColor = match?.color || match?.colorName || colorValue;

    const newSelection = {
      ...selectVa,
      color: resolvedColor,
      ...(match?.size ? { size: match.size } : {}),
    };

    setSelectVa(newSelection);
    if (match) {
      setSelectVariant(match);
    }
  };

  useEffect(() => {
    if (!product?.variants || product.variants.length === 0) return;

    const HIDDEN_VARIANT_KEYS = new Set([
      "_id",
      "title",
      "price",
      "originalPrice",
      "quantity",
      "sku",
      "barcode",
      "image",
      "images",
      "dynamicSections",
      "mediaSections",
      "video",
      "discount",
      "color",
      "thumbnail",
      "combinationlabel",
      "hoverimage",
      "colorname",
      "enabled",
    ]);

    const isSizeKey = (key) => {
      const lower = String(key).toLowerCase();
      return lower === "size" || lower.includes("size");
    };

    const variantKeys = Object.keys(Object.assign({}, ...product.variants));
    const attributeKeys = variantKeys.filter((key) => {
      const lower = String(key).toLowerCase();
      if (HIDDEN_VARIANT_KEYS.has(lower)) return false;
      return isSizeKey(key);
    });

    const dynamicVarTitle = attributeKeys.map((key) => {
      const isSize = isSizeKey(key);
      const values = isSize
        ? UK_SIZE_RANGES
        : [
            ...new Set(product.variants.map((v) => v[key]).filter(Boolean)),
          ];

      const dbAtt = attributes?.find(
        (att) =>
          att._id === key ||
          att.name?.en?.toLowerCase() === key.toLowerCase() ||
          att.title?.en?.toLowerCase() === key.toLowerCase()
      );
      if (dbAtt) {
        return {
          ...dbAtt,
          _id: key,
          option: "BUTTON",
          variants: values.map((val) => {
            const dbVariant = dbAtt.variants?.find(
              (el) =>
                el._id === val ||
                el.name?.en === val ||
                showingTranslateValue(el.name) === val
            );
            return dbVariant
              ? { ...dbVariant, _id: val }
              : { _id: val, name: { en: val } };
          }),
        };
      }

      return {
        _id: key,
        name: { en: "Size" },
        title: { en: "Size" },
        option: "BUTTON",
        variants: values.map((val) => ({
          _id: val,
          name: { en: val },
        })),
      };
    });

    setVariantTitle(dynamicVarTitle);
  }, [product?.variants, attributes, showingTranslateValue]);

  useEffect(() => {
    setIsLoading(false);
  }, [product]);

  // Mobile sticky cart bar when buy section scrolls out of view
  useEffect(() => {
    const handleScroll = () => {
      const isDesktop = window.innerWidth >= 1024;
      const buySection = document.getElementById("product-buy-section");
      if (buySection && !isDesktop) {
        const rect = buySection.getBoundingClientRect();
        setShowStickyBottomBar(rect.bottom < 0);
      } else {
        setShowStickyBottomBar(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const resolveSelectedVariant = () => {
    if (!product?.variants?.length) return null;
    if (selectVariant?._id || selectVariant?.sku) return selectVariant;

    const keys = selectableAttributeKeys;
    if (keys.length === 0) {
      return product.variants[0];
    }

    const selection = { ...selectVariant, ...selectVa };
    return (
      product.variants.find((variant) =>
        keys.every((key) => {
          const selected = selection[key];
          if (!selected) return true;
          return variant[key] === selected;
        })
      ) || null
    );
  };

  const handleAddToCart = (p) => {
    if (stock <= 0) return notifyError("Insufficient stock");

    const hasVariants = product?.variants && product.variants.length > 0;
    const activeVariant = resolveSelectedVariant();

    if (hasVariants && selectableAttributeKeys.length > 0) {
      const allSelected = selectableAttributeKeys.every(
        (key) => activeVariant?.[key] || selectVa?.[key] || selectVariant?.[key]
      );
      if (!allSelected || !activeVariant) {
        return notifyError("Please select all variants first!");
      }
    } else if (hasVariants && !activeVariant) {
      return notifyError("Please select all variants first!");
    }

    const { variants, categories, description, ...updatedProduct } = product;

    // Ensure we have a valid price
    const currentPrice = price > 0
      ? price
      : getNumber(selectVariant?.price ?? product?.prices?.price ?? 0);

    const currentOriginalPrice = originalPrice > 0
      ? originalPrice
      : getNumber(selectVariant?.originalPrice ?? product?.prices?.originalPrice ?? currentPrice);

    const newItem = {
      ...updatedProduct,
      isCombination: hasVariants,
      id: `${
        !hasVariants || p.variants.length === 0
          ? p._id
          : p._id +
            "-" +
            variantTitle?.map((att) => selectVariant[att._id]).join("-")
      }`,

      title: `${
        !hasVariants || p.variants.length === 0
          ? dynamicTitle || showingTranslateValue(product?.title)
          : (dynamicTitle || showingTranslateValue(product?.title)) +
            "-" +
            variantTitle
              ?.map((att) =>
                att.variants?.find((v) => v._id === selectVariant[att._id])
              )
              .map((el) => showingTranslateValue(el?.name))
      }`,
      image: activeImage || product.image?.[0] || product.images?.[0],
      variant: activeVariant || selectVariant,
      price: currentPrice,
      originalPrice: currentOriginalPrice,
    };

    handleAddItem(newItem, 1);
  };

  const handleAddToWishlist = (p) => {
    if (typeof window === "undefined") return;
    
    try {
      const result = addToWishlist(p);

      if (!result.ok && result.reason === "exists") {
        notifyError("Product already in wishlist");
        return;
      }

      if (!result.ok) {
        notifyError("Failed to add to wishlist");
        return;
      }

      notifySuccess("Product added to wishlist");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      notifyError("Failed to add to wishlist");
    }
  };

  const handleAddToCompare = (p) => {
    if (typeof window === "undefined") return;
    
    try {
      const storedCompare = localStorage.getItem("compare");
      let compare = storedCompare ? JSON.parse(storedCompare) : [];
      
      // Check if product already exists in compare
      const exists = compare.some((item) => item._id === p._id);
      
      if (exists) {
        notifyError("Product already in compare list");
        return;
      }
      
      // Limit compare list to 4 products
      if (compare.length >= 4) {
        notifyError("You can compare maximum 4 products");
        return;
      }
      
      // Add product to compare
      compare.push(p);
      localStorage.setItem("compare", JSON.stringify(compare));
      notifySuccess("Product added to compare list");
    } catch (error) {
      console.error("Error adding to compare:", error);
      notifyError("Failed to add to compare list");
    }
  };

  const handleBuyNow = (p) => {
    try {
      // Check stock first - handle products with and without variants
      if (stock <= 0) {
        return notifyError("Insufficient stock");
      }

      // Check if variants need to be selected
      const hasVariants = product?.variants && product.variants.length > 0;
      const activeVariant = resolveSelectedVariant();

      if (hasVariants && selectableAttributeKeys.length > 0) {
        const allSelected = selectableAttributeKeys.every(
          (key) => activeVariant?.[key] || selectVa?.[key] || selectVariant?.[key]
        );
        if (!allSelected || !activeVariant) {
          return notifyError("Please select all variants first!");
        }
      } else if (hasVariants && !activeVariant) {
        return notifyError("Please select all variants first!");
      }

      // Prepare product item for direct checkout
      const { variants, categories, description, ...updatedProduct } = product;

      // Ensure we have a valid price
      const currentPrice = price > 0
        ? price
        : getNumber(selectVariant?.price ?? product?.prices?.price ?? 0);
      const currentOriginalPrice = originalPrice > 0
        ? originalPrice
        : getNumber(selectVariant?.originalPrice ?? product?.prices?.originalPrice ?? currentPrice);

      const minQtyBuy = item;
      const newItem = {
        ...updatedProduct,
        id: `${
          !hasVariants || (p.variants && p.variants.length <= 1)
            ? p._id
            : p._id +
              variantTitle?.map((att) => selectVariant[att._id]).join("-")
        }`,
        title: `${
          !hasVariants || (p.variants && p.variants.length <= 1)
            ? dynamicTitle || showingTranslateValue(product?.title)
            : (dynamicTitle || showingTranslateValue(product?.title)) +
              "-" +
              variantTitle
                ?.map((att) =>
                  att.variants?.find((v) => v._id === selectVariant[att._id])
                )
                .map((el) => showingTranslateValue(el?.name))
        }`,
        image: activeImage || product.image?.[0],
        variant: activeVariant || selectVariant || {},
        price: currentPrice,
        originalPrice: currentOriginalPrice,
        quantity: minQtyBuy,
      };

      // Replace entire cart with only this product (Flipkart style - Buy Now replaces cart)
      setItems([newItem]);

      // Go straight to checkout — login is optional, not forced
      setTimeout(() => {
        router.push("/checkout");
      }, 150);
    } catch (error) {
      console.error("Buy Now error:", error);
      notifyError("Something went wrong. Please try again.");
    }
  };

  // Share current product + variant selection URL
  const handleShareCurrentVariant = async () => {
    const urlToShare =
      (typeof window !== "undefined" && window.location.href) ||
      shareUrl ||
      `https://Rasa Store-store-nine.vercel.app/product/${router.query.slug}`;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: dynamicTitle || showingTranslateValue(product?.title),
          text: dynamicDescription || showingTranslateValue(product?.description),
          url: urlToShare,
        });
        return;
      }

      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        await navigator.clipboard.writeText(urlToShare);
        notifySuccess("Link copied to clipboard!");
        return;
      }

      notifySuccess("Share this link: " + urlToShare);
    } catch (err) {
      if (err?.name === "AbortError") return;
      notifyError("Unable to share link. Please try again.");
    }
  };

  const handleChangeImage = (img) => {
    if (img) {
      setActiveImage(img);
    }
  };

  const { t } = useTranslation();

  // category name slug
  const category_name = (showingTranslateValue(product?.category?.name) || "")
    .toLowerCase()
    .replace(/[^A-Z0-9]+/gi, "-");

  // Helper to create URL-friendly slugs for attribute/variant names
  const slugify = (str = "") =>
    str
      ?.toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // NOTE: Variant URL syncing disabled to avoid navigation loops during Buy Now flow.
  // If you want to re-enable deep-linking by variant, restore the previous
  // useEffects that read/write variant params from/to the URL.

  // console.log("discount", discount);

  return (

    <>

      {isLoading ? (

        <Loading loading={isLoading} />

      ) : (

        <Layout

          title={dynamicTitle || showingTranslateValue(product?.title)}

          description={dynamicDescription || showingTranslateValue(product.description)}

        >

          <div className="bg-[#050505] min-h-screen">

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-16">

              {/* Breadcrumb — Aisha style */}

              <nav className="text-xs sm:text-sm text-neutral-500 mb-6 lg:mb-8">

                <Link href="/" className="hover:text-[#D4AF37] transition-colors">

                  Home

                </Link>

                <span className="mx-1.5 text-neutral-700">/</span>

                <Link

                  href={`/search?category=${category_name}&_id=${product?.category?._id}`}

                  className="hover:text-[#D4AF37] transition-colors capitalize"

                >

                  {category_name.replace(/-/g, " ") || "Shop"}

                </Link>

                <span className="mx-1.5 text-neutral-700">/</span>

                <span className="text-neutral-300">

                  {dynamicTitle || showingTranslateValue(product?.title)}

                </span>

              </nav>



              <div className="flex flex-col lg:flex-row lg:gap-10 xl:gap-14">

                {/* Gallery — left, sticky */}

                <div className="w-full lg:w-[55%] xl:w-[58%] lg:sticky lg:top-24 lg:self-start">

                  <ProductImageGallery

                    images={galleryImages}

                    productTitle={dynamicTitle || showingTranslateValue(product?.title)}

                  />

                </div>



                {/* Product info — right */}

                <div className="w-full lg:w-[45%] xl:w-[42%] mt-8 lg:mt-0" id="product-buy-section">

                  <div className="rounded-xl">

                    {/* Quick actions */}

                    <div className="flex items-center justify-end gap-1 mb-4">

                      <button

                        type="button"

                        onClick={() => handleAddToWishlist(product)}

                        className="p-2.5 text-neutral-400 hover:text-red-400 transition-colors rounded-lg hover:bg-neutral-900/60"

                        aria-label="Wishlist"

                      >

                        <FiHeart className="w-5 h-5" />

                      </button>

                      <button

                        type="button"

                        onClick={() => handleAddToCompare(product)}

                        className="p-2.5 text-neutral-400 hover:text-purple-400 transition-colors rounded-lg hover:bg-neutral-900/60"

                        aria-label="Compare"

                      >

                        <FiShuffle className="w-5 h-5" />

                      </button>

                      <button

                        type="button"

                        onClick={handleShareCurrentVariant}

                        className="p-2.5 text-neutral-400 hover:text-[#D4AF37] transition-colors rounded-lg hover:bg-neutral-900/60"

                        aria-label="Share"

                      >

                        <FiShare2 className="w-5 h-5" />

                      </button>

                    </div>



                    {product?.badge && (

                      <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-2">

                        {product.badge}

                      </span>

                    )}



                    <h1 className="font-serif text-2xl sm:text-[1.75rem] lg:text-3xl text-white font-medium leading-snug tracking-tight">

                      {dynamicTitle || showingTranslateValue(product?.title)}

                    </h1>

                    {dynamicDescription && (
                      <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                        {dynamicDescription}
                      </p>
                    )}

                    {showingTranslateValue(product?.highlights) && (
                      <div className="mt-4 text-sm text-neutral-400 leading-relaxed whitespace-pre-line">
                        {isReadMore
                          ? `${showingTranslateValue(product?.highlights).slice(0, 180)}${
                              showingTranslateValue(product?.highlights).length > 180 ? "..." : ""
                            }`
                          : showingTranslateValue(product?.highlights)}
                        {showingTranslateValue(product?.highlights).length > 180 && (
                          <button
                            type="button"
                            onClick={() => setIsReadMore(!isReadMore)}
                            className="ml-1 text-[#D4AF37] hover:text-white font-medium transition-colors"
                          >
                            {isReadMore ? "Read more" : "Read less"}
                          </button>
                        )}
                      </div>
                    )}



                    <div className="mt-4">

                      <p className="text-sm text-neutral-500 mb-1">Regular price</p>

                      <p className="text-2xl sm:text-3xl text-white font-medium tracking-tight">

                        {currency}

                        {getNumberTwo(displayOriginalPrice)}

                      </p>

                    </div>



                    <hr className="my-6 border-neutral-800" />



                    {showColorPicker && (
                      <div className="mb-6">
                        <p className="text-sm text-neutral-400 mb-2">Color</p>
                        <ColorImagePicker
                          options={colorOptions}
                          selectedColor={
                            selectVa?.color ||
                            selectVariant?.color ||
                            selectVariant?.colorName ||
                            colorOptions[0]?.color ||
                            ""
                          }
                          onSelect={handleColorSelect}
                        />
                      </div>
                    )}

                    {/* Size variants */}
                    {variantTitle?.length > 0 && (
                      <div className="space-y-5 mb-6">
                        {variantTitle.map((a, i) => (
                          <div key={i + 1}>
                            <p className="text-sm text-neutral-400 mb-2">
                              {showingTranslateValue(a?.name)}
                            </p>
                            <VariantList

                              att={a._id}

                              lang={lang}

                              option={a.option}

                              setValue={setValue}

                              varTitle={variantTitle}

                              setSelectVa={setSelectVa}

                              variants={product.variants}

                              selectVariant={selectVariant}

                              setSelectVariant={setSelectVariant}

                            />

                          </div>

                        ))}

                      </div>

                    )}



                    {/* Quantity */}

                    <div className="mb-6">

                      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">

                        Quantity

                      </p>

                      <div className="inline-flex items-center border border-neutral-700 h-11 rounded-lg overflow-hidden">

                        <button

                          type="button"

                          onClick={() => setItem(Math.max(1, item - 1))}

                          className="w-11 h-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors"

                          aria-label="Decrease"

                        >

                          <FiMinus className="w-4 h-4" />

                        </button>

                        <span className="w-12 text-center text-white font-medium text-sm">

                          {item}

                        </span>

                        <button

                          type="button"

                          onClick={() => setItem(item + 1)}

                          className="w-11 h-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors"

                          aria-label="Increase"

                        >

                          <FiPlus className="w-4 h-4" />

                        </button>

                      </div>

                    </div>



                    {/* Add to cart — full width like Aisha */}

                    <button

                      type="button"

                      onClick={() => handleAddToCart(product)}

                      className="w-full h-12 bg-white text-black hover:bg-neutral-200 font-semibold text-sm uppercase tracking-widest transition-colors mb-3 rounded-lg"

                    >

                      Add to Cart

                    </button>

                    <button

                      type="button"

                      onClick={(e) => {

                        e.preventDefault();

                        e.stopPropagation();

                        handleBuyNow(product);

                      }}

                      className="w-full h-12 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-semibold text-sm uppercase tracking-widest transition-colors rounded-lg"

                    >

                      Buy It Now

                    </button>



                    {stock > 0 && stock <= 10 && (

                      <p className="mt-4 text-sm text-amber-400/90">

                        Hurry, {stock} item{stock !== 1 ? "s" : ""} left in stock!

                      </p>

                    )}



                    <hr className="my-6 border-neutral-800" />



                    <div className="text-sm text-neutral-500 space-y-1.5 mb-2">

                      {product.sku && (

                        <p>

                          <span className="text-neutral-600">Sku:</span>{" "}

                          <span className="text-neutral-300">{product.sku}</span>

                        </p>

                      )}

                      <p>

                        <span className="text-neutral-600">Available:</span>{" "}

                        <span className={stock > 0 ? "text-emerald-500" : "text-red-400"}>

                          {stock > 0 ? "Available" : "Out of stock"}

                        </span>

                      </p>

                    </div>

                  </div>

                </div>

              </div>

              <ProductDetailsSection
                dynamicSections={
                  variantDynamicSections ||
                  (Array.isArray(product?.dynamicSections) ? product.dynamicSections : [])
                }
                mediaSections={
                  variantMediaSections ||
                  (Array.isArray(product?.mediaSections) ? product.mediaSections : [])
                }
                selectedAttributes={selectVa}
                isVariantSpecific={Boolean(variantDynamicSections || variantMediaSections)}
              />

            </div>

            <RelatedProductsSection
              products={displayRelatedProducts}
              attributes={attributes}
              title="You may also like"
            />



            {/* Mobile sticky bar */}

            {showStickyBottomBar && (

              <div className="fixed bottom-0 left-0 right-0 z-[60] bg-[#0A0A0A]/95 backdrop-blur-md border-t border-neutral-800 lg:hidden">

                <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

                  <div className="min-w-0">

                    <p className="text-[10px] text-neutral-500 truncate uppercase tracking-wider">

                      {dynamicTitle || showingTranslateValue(product?.title)}

                    </p>

                    <p className="text-lg font-semibold text-white">

                      {currency}

                      {getNumberTwo(displayOriginalPrice)}

                    </p>

                  </div>

                  <button

                    type="button"

                    onClick={() => handleAddToCart(product)}

                    className="shrink-0 h-11 px-6 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg"

                  >

                    Add to Cart

                  </button>

                </div>

              </div>

            )}

          </div>

        </Layout>

      )}

    </>

  );

};


export const getServerSideProps = async (context) => {
  const { slug } = context.params;

  const [data, attributes, storeData] = await Promise.all([
    ProductServices.getShowingStoreProducts({
      category: "",
      slug: slug,
    }),
    AttributeServices.getShowingAttributes({}),
    ProductServices.getShowingStoreProducts({}),
  ]);

  const product = slug
    ? data?.products?.find((p) => p.slug === slug) || {}
    : {};
  const currentId = product?._id;

  const mergeUnique = (...lists) => {
    const seen = new Set();
    const merged = [];
    lists.flat().forEach((p) => {
      if (!p?._id || p._id === currentId || seen.has(String(p._id))) return;
      seen.add(String(p._id));
      merged.push(p);
    });
    return merged.slice(0, 12);
  };

  const relatedProducts = mergeUnique(
    data?.relatedProducts,
    storeData?.popularProducts,
    storeData?.bestSellingProducts,
    storeData?.discountedProducts,
    storeData?.products
  );

  return {
    props: {
      product,
      attributes,
      relatedProducts,
    },
  };
};

export default ProductScreen;

