import ReactTagInput from "@pathofdev/react-tag-input";
import {
  Button,
  Input,
  TableCell,
  TableContainer,
  TableHeader,
  Textarea,
  Table,
} from "@windmill/react-ui";
import Multiselect from "multiselect-react-dropdown";
import React from "react";
import {useState, useContext} from "react";
import { Scrollbars } from "react-custom-scrollbars-2";
import { MultiSelect } from "react-multi-select-component";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import { FiX, FiChevronUp, FiChevronDown, FiTrash2 } from "react-icons/fi";

//internal import

import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import LabelArea from "@/components/form/selectOption/LabelArea";
import DrawerButton from "@/components/form/button/DrawerButton";
import InputValue from "@/components/form/input/InputValue";
import useProductSubmit from "@/hooks/useProductSubmit";
import ActiveButton from "@/components/form/button/ActiveButton";
import InputValueFive from "@/components/form/input/InputValueFive";
import Uploader from "@/components/image-uploader/Uploader";
import ParentCategory from "@/components/category/ParentCategory";
import UploaderThree from "@/components/image-uploader/UploaderThree";
import AttributeOptionTwo from "@/components/attribute/AttributeOptionTwo";
import AttributeListTable from "@/components/attribute/AttributeListTable";
import SwitchToggleForCombination from "@/components/form/switch/SwitchToggleForCombination";
import { notifySuccess, notifyError } from "@/utils/toast";
import BrandServices from "@/services/BrandServices";
import TaxServices from "@/services/TaxServices";
import CategoryServices from "@/services/CategoryServices";
import { SidebarContext } from "@/context/SidebarContext";
import useAsync from "@/hooks/useAsync";
import ProductPlacementFlags from "@/components/product/ProductPlacementFlags";
import { UK_SIZES } from "@/components/product/FashionProductCoreFields";
import ColorVariantManager from "@/components/product/ColorVariantManager";
import ProductPreviewCard from "@/components/product/ProductPreviewCard";

//internal import

const ProductDrawer = ({ id }) => {
  const { t } = useTranslation();
  const { setIsUpdate } = useContext(SidebarContext);

  const {
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
    imageUrl,
    setImageUrl,
    thumbnailUrl,
    setThumbnailUrl,
    handleSubmit,
    isCombination,
    variantTitle,
    attributes,
    attTitle,
    handleAddAtt,
    // productId,
    onCloseModal,
    isBulkUpdate,
    globalSetting,
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
    brandOptions,
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
    
    // New Sections Props
    productDescription: productDescriptionSection, setProductDescription: setProductDescriptionSection,
    additionalInformation, setAdditionalInformation,
    productHighlights, setProductHighlights,
    manufacturerDetails, setManufacturerDetails,
    disclaimer, setDisclaimer,
    faqSection, setFaqSection,
    featuredImage, setFeaturedImage,
    hoverImage, setHoverImage,
    badge, setBadge,
    video, setVideo,
    seoImage, setSeoImage,
  } = useProductSubmit(id);
  const { currency, showingTranslateValue } = useUtilsFunction();
  
  // Fetch taxes from backend
  const { data: taxOptionsFromApi, loading: taxLoading } = useAsync(TaxServices.getAll);
  
  // Local state to manage taxes (allows immediate updates)
  const [taxOptions, setTaxOptions] = useState([]);
  const [selectedUkSizes, setSelectedUkSizes] = useState([]);
  
  // Update local tax state when API data changes
  React.useEffect(() => {
    if (taxOptionsFromApi && Array.isArray(taxOptionsFromApi)) {
      setTaxOptions(taxOptionsFromApi);
    }
  }, [taxOptionsFromApi]);
  
  // Default hardcoded GST rates
  const defaultGstRates = [
    { label: "GST 0%", value: 0 },
    { label: "GST 5%", value: 5 },
    { label: "GST 12%", value: 12 },
    { label: "GST 18%", value: 18 },
    { label: "GST 28%", value: 28 },
  ];
  
  // Combine default rates with backend taxes (avoid duplicates by rate value)
  const gstRates = React.useMemo(() => {
    const ratesMap = new Map();
    
    // First add default rates
    defaultGstRates.forEach(rate => {
      ratesMap.set(rate.value, rate);
    });
    
    // Then add backend taxes (will override defaults if same rate exists)
    if (taxOptions && Array.isArray(taxOptions) && taxOptions.length > 0) {
      taxOptions.forEach((tax) => {
        const rateValue = tax.rate || 0;
        ratesMap.set(rateValue, {
          label: tax.name || `GST ${rateValue}%`,
          value: rateValue,
        });
      });
    }
    
    // Convert map to array and sort by value
    return Array.from(ratesMap.values()).sort((a, b) => a.value - b.value);
  }, [taxOptions]);
  const isPriceInclusiveChecked = Boolean(watch("isPriceInclusive"));
  const [isVariantEditOpen, setVariantEditOpen] = useState(false);
  const [variantEditIndex, setVariantEditIndex] = useState(null);
  const [variantEditForm, setVariantEditForm] = useState({
    sku: "",
    barcode: "",
    productId: "",
    originalPrice: 0,
    price: 0,
    discount: 0,
    quantity: 0,
  });
  const [variantGallery, setVariantGallery] = useState([]);
  const [variantDynamicSectionsState, setVariantDynamicSectionsState] =
    useState([]);
  const [variantMediaSectionsState, setVariantMediaSectionsState] = useState(
    []
  );
  const [variantName, setVariantName] = useState("");
  const [variantDescription, setVariantDescription] = useState("");
  const [variantSlug, setVariantSlug] = useState("");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [isQuickBrandOpen, setIsQuickBrandOpen] = useState(false);
  const [quickBrandName, setQuickBrandName] = useState("");
  const [isQuickTaxOpen, setIsQuickTaxOpen] = useState(false);
  const [quickTaxName, setQuickTaxName] = useState("");
  const [quickTaxRate, setQuickTaxRate] = useState("");
  const [isQuickCategoryOpen, setIsQuickCategoryOpen] = useState(false);
  const [quickCategoryName, setQuickCategoryName] = useState("");
  const cloneSections = (sections = []) =>
    JSON.parse(JSON.stringify(Array.isArray(sections) ? sections : []));

  // Helper to build human-readable combination label from selected attributes
  const buildCombinationLabel = (currentVariant = {}) => {
    if (!Array.isArray(variantTitle) || variantTitle.length === 0) return "";

    const parts = [];
    variantTitle.forEach((attribute) => {
      const valueId = currentVariant[attribute._id];
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

  // Helper to generate UUID (simple version)
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Helper to generate URL-friendly slug from a title
  const generateSlug = (value = "") =>
    value
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // Handle quick brand create
  const handleQuickCreateBrand = async () => {
    if (!quickBrandName.trim()) {
      notifyError("Brand name is required");
      return;
    }

    try {
      const payload = {
        name: {
          [language]: quickBrandName.trim(),
        },
        description: {
          [language]: "",
        },
        slug: generateSlug(quickBrandName),
        websiteUrl: "",
        sortOrder: 0,
        logo: "",
        coverImage: "",
        isFeatured: false,
        status: "show",
      };

      const res = await BrandServices.addBrand(payload);
      notifySuccess(res?.message || "Brand created successfully");
      setIsQuickBrandOpen(false);
      setQuickBrandName("");
      // Refresh brand list by triggering update
      if (setIsUpdate) {
        setIsUpdate(true);
      }
      // Auto-select the newly created brand
      const newBrand = res?.data || res;
      if (newBrand?._id) {
        setBrand({
          _id: newBrand._id,
          name: newBrand.name,
        });
      }
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message || "Failed to create brand");
    }
  };

  // Handle quick tax create
  const handleQuickCreateTax = async () => {
    if (!quickTaxName.trim()) {
      notifyError("Tax name is required");
      return;
    }
    if (quickTaxRate === "" || isNaN(Number(quickTaxRate))) {
      notifyError("Valid tax rate is required");
      return;
    }

    try {
      const payload = {
        name: quickTaxName.trim(),
        rate: Number(quickTaxRate),
      };

      const res = await TaxServices.add(payload);
      notifySuccess("Tax created successfully");
      
      // Immediately add the new tax to local state
      const newTax = {
        _id: res?.data?._id || Date.now().toString(),
        name: quickTaxName.trim(),
        rate: Number(quickTaxRate),
      };
      setTaxOptions((prev) => [...prev, newTax]);
      
      setIsQuickTaxOpen(false);
      setQuickTaxName("");
      setQuickTaxRate("");
      
      // Refresh tax list by triggering update (for future loads)
      if (setIsUpdate) {
        setIsUpdate(true);
      }
      
      // Auto-select the newly created tax rate
      setValue("taxRate", Number(quickTaxRate));
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message || "Failed to create tax");
    }
  };

  // Handle quick sub-category create
  const handleQuickCreateCategory = async () => {
    if (!quickCategoryName.trim()) {
      notifyError("Category name is required");
      return;
    }

    // Get parent category (use defaultCategory if available, otherwise first selectedCategory)
    const parentCategory = defaultCategory?.[0] || selectedCategory?.[0];
    
    if (!parentCategory || !parentCategory._id) {
      notifyError("Please select a parent category first");
      return;
    }

    try {
      const payload = {
        name: {
          [language]: quickCategoryName.trim(),
        },
        description: {
          [language]: "",
        },
        parentId: parentCategory._id,
        parentName: showingTranslateValue(parentCategory.name) || "Home",
        icon: "",
        status: "show",
        lang: language,
      };

      const res = await CategoryServices.addCategory(payload);
      notifySuccess(res?.message || "Sub-category created successfully");
      
      setIsQuickCategoryOpen(false);
      setQuickCategoryName("");
      
      // Refresh category list by triggering update
      if (setIsUpdate) {
        setIsUpdate(true);
      }
      
      // Don't manually add to selectedCategory - let the refresh handle it
      // The setIsUpdate(true) will trigger ParentCategory to refresh and load the new category
      // This avoids format mismatch issues with Multiselect expecting string names
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message || "Failed to create sub-category");
    }
  };

  // Helper to generate variant slug with UUID
  const generateVariantSlug = (productSlug, combinationLabel, existingSlug = "") => {
    const baseSlug = productSlug || slug || "product";
    
    // If no combination label, use main product slug
    if (!combinationLabel || combinationLabel.trim() === "") {
      return baseSlug;
    }
    
    // Extract UUID from existing slug if it exists, otherwise generate new one
    let uuid = "";
    if (existingSlug && existingSlug.includes("-")) {
      const parts = existingSlug.split("-");
      const lastPart = parts[parts.length - 1];
      // Check if last part looks like a UUID (8 chars)
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

  // Treat only YouTube links as "video" for product media
  const isVideoUrl = (url = "") => {
    if (!url || typeof url !== "string") return false;
    const lowered = url.toLowerCase();
    return (
      lowered.includes("youtube.com/") ||
      lowered.includes("youtu.be/")
    );
  };

  const handleAddDynamicSection = () => {
    setDynamicSections((prev) => [
      ...prev,
      { name: "", description: "", isVisible: true, subsections: [] },
    ]);
  };

  const handleDynamicSectionChange = (sectionIndex, field, value) => {
    setDynamicSections((prev) =>
      prev.map((section, idx) =>
        idx === sectionIndex ? { ...section, [field]: value } : section
      )
    );
  };

  const handleRemoveDynamicSection = (sectionIndex) => {
    setDynamicSections((prev) =>
      prev.filter((_, idx) => idx !== sectionIndex)
    );
  };

  const handleAddSubsection = (sectionIndex, type = "keyValue") => {
    setDynamicSections((prev) =>
      prev.map((section, idx) => {
        if (idx === sectionIndex) {
          const newSubsection =
            type === "paragraph"
              ? { type: "paragraph", content: "", isVisible: true }
              : { type: "keyValue", key: "", value: "", isVisible: true };
          return {
            ...section,
            subsections: [...(section.subsections || []), newSubsection],
          };
        }
        return section;
      })
    );
  };

  const handleSubsectionChange = (
    sectionIndex,
    subsectionIndex,
    field,
    value
  ) => {
    setDynamicSections((prev) =>
      prev.map((section, idx) => {
        if (idx === sectionIndex) {
          const currentSubsections = section.subsections || [];
          const updatedSubsections = currentSubsections.map((sub, subIdx) =>
            subIdx === subsectionIndex ? { ...sub, [field]: value } : sub
          );
          return { ...section, subsections: updatedSubsections };
        }
        return section;
      })
    );
  };

  const handleSubsectionTypeChange = (
    sectionIndex,
    subsectionIndex,
    type
  ) => {
    setDynamicSections((prev) =>
      prev.map((section, idx) => {
        if (idx === sectionIndex) {
          const currentSubsections = section.subsections || [];
          const updatedSubsections = currentSubsections.map((sub, subIdx) => {
            if (subIdx === subsectionIndex) {
              if (type === "paragraph") {
                return {
                  type: "paragraph",
                  content: sub.content || "",
                  isVisible: sub?.isVisible !== false,
                };
              }
              return {
                type: "keyValue",
                key: sub.key || "",
                value: sub.value || "",
                isVisible: sub?.isVisible !== false,
              };
            }
            return sub;
          });
          return { ...section, subsections: updatedSubsections };
        }
        return section;
      })
    );
  };

  const handleRemoveSubsection = (sectionIndex, subsectionIndex) => {
    setDynamicSections((prev) =>
      prev.map((section, idx) => {
        if (idx === sectionIndex) {
          const currentSubsections = section.subsections || [];
          return {
            ...section,
            subsections: currentSubsections.filter(
              (_, subIdx) => subIdx !== subsectionIndex
            ),
          };
        }
        return section;
      })
    );
  };

  const handleAddMediaSection = () => {
    setMediaSections((prev) => [
      ...prev,
      { name: "", description: "", isVisible: true, items: [] },
    ]);
  };

  const handleMediaSectionChange = (sectionIndex, field, value) => {
    setMediaSections((prev) =>
      prev.map((section, idx) =>
        idx === sectionIndex ? { ...section, [field]: value } : section
      )
    );
  };

  const handleRemoveMediaSection = (sectionIndex) => {
    setMediaSections((prev) =>
      prev.filter((_, idx) => idx !== sectionIndex)
    );
  };

  const handleAddMediaItem = (sectionIndex) => {
    setMediaSections((prev) =>
      prev.map((section, idx) => {
        if (idx === sectionIndex) {
          return {
            ...section,
            items: [
              ...(section.items || []),
              { image: "", details: "" },
            ],
          };
        }
        return section;
      })
    );
  };

  const handleMediaItemChange = (sectionIndex, itemIndex, field, value) => {
    setMediaSections((prev) =>
      prev.map((section, idx) => {
        if (idx === sectionIndex) {
          const currentItems = section.items || [];
          const updatedItems = currentItems.map((item, subIdx) =>
            subIdx === itemIndex ? { ...item, [field]: value } : item
          );
          return { ...section, items: updatedItems };
        }
        return section;
      })
    );
  };

  const handleRemoveMediaItem = (sectionIndex, itemIndex) => {
    setMediaSections((prev) =>
      prev.map((section, idx) => {
        if (idx === sectionIndex) {
          return {
            ...section,
            items: (section.items || []).filter(
              (_, subIdx) => subIdx !== itemIndex
            ),
          };
        }
        return section;
      })
    );
  };

  // Variant-specific editors
  const handleVariantAddDynamicSection = () => {
    setVariantDynamicSectionsState((prev) => [
      ...prev,
      { name: "", description: "", isVisible: true, subsections: [] },
    ]);
  };

  const handleVariantDynamicSectionChange = (sectionIndex, field, value) => {
    setVariantDynamicSectionsState((prev) =>
      prev.map((section, idx) =>
        idx === sectionIndex ? { ...section, [field]: value } : section
      )
    );
  };

  const handleVariantRemoveDynamicSection = (sectionIndex) => {
    setVariantDynamicSectionsState((prev) =>
      prev.filter((_, idx) => idx !== sectionIndex)
    );
  };

  const handleVariantAddSubsection = (sectionIndex, type = "keyValue") => {
    setVariantDynamicSectionsState((prev) =>
      prev.map((section, idx) => {
        if (idx === sectionIndex) {
          const newSubsection =
            type === "paragraph"
              ? { type: "paragraph", content: "", isVisible: true }
              : { type: "keyValue", key: "", value: "", isVisible: true };
          return {
            ...section,
            subsections: [...(section.subsections || []), newSubsection],
          };
        }
        return section;
      })
    );
  };

  const handleVariantSubsectionChange = (
    sectionIndex,
    subsectionIndex,
    field,
    value
  ) => {
    setVariantDynamicSectionsState((prev) =>
      prev.map((section, idx) => {
        if (idx === sectionIndex) {
          const updatedSubsections = (section.subsections || []).map(
            (sub, subIdx) =>
              subIdx === subsectionIndex ? { ...sub, [field]: value } : sub
          );
          return { ...section, subsections: updatedSubsections };
        }
        return section;
      })
    );
  };

  const handleVariantSubsectionTypeChange = (
    sectionIndex,
    subsectionIndex,
    type
  ) => {
    setVariantDynamicSectionsState((prev) =>
      prev.map((section, idx) => {
        if (idx === sectionIndex) {
          const updatedSubsections = (section.subsections || []).map(
            (sub, subIdx) => {
              if (subIdx === subsectionIndex) {
                if (type === "paragraph") {
                  return {
                    type: "paragraph",
                    content: sub.content || "",
                    isVisible: sub?.isVisible !== false,
                  };
                }
                return {
                  type: "keyValue",
                  key: sub.key || "",
                  value: sub.value || "",
                  isVisible: sub?.isVisible !== false,
                };
              }
              return sub;
            }
          );
          return { ...section, subsections: updatedSubsections };
        }
        return section;
      })
    );
  };

  const handleVariantRemoveSubsection = (sectionIndex, subsectionIndex) => {
    setVariantDynamicSectionsState((prev) =>
      prev.map((section, idx) => {
        if (idx === sectionIndex) {
          return {
            ...section,
            subsections: (section.subsections || []).filter(
              (_, subIdx) => subIdx !== subsectionIndex
            ),
          };
        }
        return section;
      })
    );
  };

  const handleVariantAddMediaSection = () => {
    setVariantMediaSectionsState((prev) => [
      ...prev,
      { name: "", description: "", isVisible: true, items: [] },
    ]);
  };

  const handleVariantMediaSectionChange = (sectionIndex, field, value) => {
    setVariantMediaSectionsState((prev) =>
      prev.map((section, idx) =>
        idx === sectionIndex ? { ...section, [field]: value } : section
      )
    );
  };

  const handleVariantRemoveMediaSection = (sectionIndex) => {
    setVariantMediaSectionsState((prev) =>
      prev.filter((_, idx) => idx !== sectionIndex)
    );
  };

  const handleVariantAddMediaItem = (sectionIndex) => {
    setVariantMediaSectionsState((prev) =>
      prev.map((section, idx) => {
        if (idx === sectionIndex) {
          return {
            ...section,
            items: [
              ...(section.items || []),
              { image: "", details: "", isVisible: true },
            ],
          };
        }
        return section;
      })
    );
  };

  const handleVariantMediaItemChange = (
    sectionIndex,
    itemIndex,
    field,
    value
  ) => {
    setVariantMediaSectionsState((prev) =>
      prev.map((section, idx) => {
        if (idx === sectionIndex) {
          const updatedItems = (section.items || []).map((item, subIdx) =>
            subIdx === itemIndex ? { ...item, [field]: value } : item
          );
          return { ...section, items: updatedItems };
        }
        return section;
      })
    );
  };

  const handleVariantRemoveMediaItem = (sectionIndex, itemIndex) => {
    setVariantMediaSectionsState((prev) =>
      prev.map((section, idx) => {
        if (idx === sectionIndex) {
          return {
            ...section,
            items: (section.items || []).filter(
              (_, subIdx) => subIdx !== itemIndex
            ),
          };
        }
        return section;
      })
    );
  };

  const toggleDynamicSectionVisibility = (sectionIndex) => {
    setDynamicSections((prev) =>
      prev.map((section, idx) =>
        idx === sectionIndex
          ? {
              ...section,
              isVisible: !(section?.isVisible !== false),
            }
          : section
      )
    );
  };

  const toggleMediaSectionVisibility = (sectionIndex) => {
    setMediaSections((prev) =>
      prev.map((section, idx) =>
        idx === sectionIndex
          ? {
              ...section,
              isVisible: !(section?.isVisible !== false),
            }
          : section
      )
    );
  };

  const handleMediaItemImageUpdate = (sectionIndex, itemIndex, url) => {
    handleMediaItemChange(sectionIndex, itemIndex, "image", url || "");
  };

  const openVariantEditModal = (variant, index) => {
    // Get the latest variant data from the variants array to ensure we have the most up-to-date information
    const currentVariant = variants?.[index] || variant;
    
    setVariantEditIndex(index);
    setVariantEditForm({
      sku: currentVariant.sku || "",
      barcode: currentVariant.barcode || "",
      productId: currentVariant.productId || "",
      originalPrice: currentVariant.originalPrice ?? 0,
      price: currentVariant.price ?? 0,
      discount: currentVariant.discount ?? 0,
      quantity: currentVariant.quantity ?? 0,
    });
    // Auto-generate combination name & description
    const mainProductTitle = resData?.title?.[language] || "";
    const mainProductDescription = resData?.description?.[language] || "";
    const combinationLabel = buildCombinationLabel(currentVariant);

    const autoCombinationName = combinationLabel
      ? `${mainProductTitle || productName || ""}${
          mainProductTitle || productName ? " - " : ""
        }${combinationLabel}`
      : mainProductTitle || productName || "";

    const autoCombinationDescription =
      mainProductDescription || productDescription || "";

    // Combination name: keep existing custom name if present, otherwise use auto-generated
    setVariantName(currentVariant?.title?.[language] || autoCombinationName || "");

    // Combination description: always default from main product description
    // (user can still override in the textarea, but we don't reuse any old variant description)
    setVariantDescription(autoCombinationDescription || "");
    
    // Set variant slug
    setVariantSlug(currentVariant?.slug || "");
    
    // Set product name and description from resData
    setProductName(resData?.title?.[language] || "");
    setProductDescription(resData?.description?.[language] || "");

    const variantImages = Array.isArray(currentVariant?.images)
      ? [...currentVariant.images]
      : [];
    const gallerySource =
      variantImages.length > 0 || currentVariant?.video
        ? [...variantImages, ...(currentVariant?.video ? [currentVariant.video] : [])]
        : Array.isArray(imageUrl)
        ? [...imageUrl]
        : [];
    setVariantGallery(gallerySource);
    setVariantDynamicSectionsState(
      cloneSections(
        currentVariant?.dynamicSections?.length
          ? currentVariant.dynamicSections
          : dynamicSections
      )
    );
    setVariantMediaSectionsState(
      cloneSections(
        currentVariant?.mediaSections?.length ? currentVariant.mediaSections : mediaSections
      )
    );
    setVariantEditOpen(true);
  };

  const handleVariantFormChange = (field, value) => {
    setVariantEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVariantEditSave = async () => {
    if (variantEditIndex === null || variantEditIndex === undefined) {
      setVariantEditOpen(false);
      return;
    }
    
    // Ensure we have the latest variant data
    const existingVariant = variants?.[variantEditIndex] || {};
    
    const galleryImages = Array.isArray(variantGallery) 
      ? (variantGallery || []).filter((url) => !isVideoUrl(url))
      : [];
    const galleryVideo =
      Array.isArray(variantGallery)
        ? (variantGallery || []).find((url) => isVideoUrl(url)) || ""
        : "";
    
    // Preserve existing title/description in other languages
    const updatedTitle = {
      ...(existingVariant?.title || {}),
      ...(variantName.trim()
        ? {
            [language]: variantName.trim(),
          }
        : {}),
    };
    const updatedDescription = {
      ...(existingVariant?.description || {}),
      ...(variantDescription.trim()
        ? {
            [language]: variantDescription.trim(),
          }
        : {}),
    };

    // Use the slug from the input field, or generate if empty
    let updatedSlug = variantSlug.trim();
    
    if (!updatedSlug) {
      // Extract combination name from variant name (everything after " - ")
      const combinationName = variantName.includes(" - ")
        ? variantName.split(" - ").slice(1).join(" - ")
        : "";
      
      // Get product slug
      const productSlug = resData?.slug || slug || "";
      
      // Generate variant slug with UUID
      updatedSlug = generateVariantSlug(
        productSlug,
        combinationName,
        existingVariant?.slug
      );
    } else {
      // Ensure slug is properly formatted
      updatedSlug = generateSlug(updatedSlug);
    }

    // Prepare update data with all fields
    const updateData = {
      sku: variantEditForm.sku || "",
      barcode: variantEditForm.barcode || "",
      productId: variantEditForm.productId || "",
      originalPrice: Number(variantEditForm.originalPrice || 0),
      price: Number(variantEditForm.originalPrice || 0) - (Number(variantEditForm.originalPrice || 0) * Number(variantEditForm.discount || 0) / 100),
      discount: Number(variantEditForm.discount || 0),
      quantity: Number(variantEditForm.quantity || 0),
      title: updatedTitle,
      description: updatedDescription,
      slug: updatedSlug,
      images: galleryImages,
      video: galleryVideo,
      dynamicSections: Array.isArray(variantDynamicSectionsState) 
        ? variantDynamicSectionsState 
        : [],
      mediaSections: Array.isArray(variantMediaSectionsState) 
        ? variantMediaSectionsState 
        : [],
    };

    // Call async handleUpdateVariant and wait for it
    await handleUpdateVariant(variantEditIndex, updateData);
    
    // Reset form state
    setVariantEditOpen(false);
    setVariantEditIndex(null);
    setVariantGallery([]);
    setVariantDynamicSectionsState([]);
    setVariantMediaSectionsState([]);
    setVariantName("");
    setVariantDescription("");
    setVariantSlug("");
    setProductName("");
    setProductDescription("");
  };

  const handleVariantEditClose = () => {
    setVariantEditOpen(false);
    setVariantEditIndex(null);
    setVariantGallery([]);
    setVariantDynamicSectionsState([]);
    setVariantMediaSectionsState([]);
    setVariantName("");
    setVariantDescription("");
    setVariantSlug("");
    setProductName("");
    setProductDescription("");
  };

  return (
    <>
      <Modal
        open={openModal}
        onClose={onCloseModal}
        center
        closeIcon={
          <div className="absolute top-0 right-0 text-red-500  active:outline-none text-xl border-0">
            <FiX className="text-3xl" />
          </div>
        }
      >
        <div className="cursor-pointer">
          <UploaderThree
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            handleSelectImage={handleSelectImage}
          />
        </div>
      </Modal>

      <Modal
        open={isVariantEditOpen}
        onClose={handleVariantEditClose}
        center
        classNames={{ modal: "rounded-lg" }}
        closeIcon={
          <div className="absolute top-0 right-0 text-red-500 active:outline-none text-xl border-0">
            <FiX className="text-3xl" />
          </div>
        }
      >
        <div className=" w-full max-w-4xl p-4">
          <h3 className="text-lg font-semibold mb-4">Edit Combination</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Combination Name
              </label>
              <Input
                value={variantName}
                onChange={(e) => {
                  setVariantName(e.target.value);
                  // Auto-generate slug when combination name changes
                  const combinationName = e.target.value.includes(" - ")
                    ? e.target.value.split(" - ").slice(1).join(" - ")
                    : e.target.value;
                  const productSlug = resData?.slug || slug || "";
                  const newSlug = generateVariantSlug(
                    productSlug,
                    combinationName,
                    variantSlug
                  );
                  setVariantSlug(newSlug);
                }}
                placeholder="Combination specific name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Combination Slug
              </label>
              <Input
                value={variantSlug}
                onChange={(e) => setVariantSlug(e.target.value)}
                placeholder="combination-slug-uuid"
                onBlur={(e) => {
                  // Ensure slug format is correct
                  const formattedSlug = generateSlug(e.target.value);
                  setVariantSlug(formattedSlug || variantSlug);
                }}
              />
              <p className="text-xs text-gray-400 mt-1">
                Auto-generated from combination name. Format: product-slug-combination-name-uuid
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Combination Description
              </label>
              <Textarea
                rows="3"
                value={variantDescription}
                onChange={(e) => setVariantDescription(e.target.value)}
                placeholder="Describe this combination"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">SKU</label>
                <Input
                  value={variantEditForm.sku}
                  onChange={(e) => handleVariantFormChange("sku", e.target.value)}
                  placeholder="SKU"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Barcode</label>
                <Input
                  value={variantEditForm.barcode}
                  onChange={(e) =>
                    handleVariantFormChange("barcode", e.target.value)
                  }
                  placeholder="Barcode"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Original Price
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  onKeyDown={(e) => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                  value={variantEditForm.originalPrice}
                  onChange={(e) =>
                    handleVariantFormChange("originalPrice", e.target.value)
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Discount Type
                </label>
                <select
                  className="block w-full rounded-md border border-gray-200 focus:border-store-500 focus:ring-0 text-sm h-10"
                  value={variantEditForm.discountType || "flat"}
                  onChange={(e) =>
                    handleVariantFormChange("discountType", e.target.value)
                  }
                >
                  <option value="flat">Flat (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Discount {variantEditForm.discountType === "percentage" ? "(%)" : "(₹)"}
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  onKeyDown={(e) => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                  value={variantEditForm.discount}
                  onChange={(e) =>
                    handleVariantFormChange("discount", e.target.value)
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Sale Price
                </label>
                <div className="block w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 h-10 flex items-center">
                  {currency}
                  {variantEditForm.discountType === "percentage"
                    ? (Math.max(0, (Number(variantEditForm.originalPrice || 0) - (Number(variantEditForm.originalPrice || 0) * Number(variantEditForm.discount || 0) / 100)))).toFixed(2)
                    : (Math.max(0, (Number(variantEditForm.originalPrice || 0) - Number(variantEditForm.discount || 0)))).toFixed(2)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Quantity</label>
                <Input
                  type="number"
                  min="0"
                  onKeyDown={(e) => (e.key === '-' || e.key === 'e' || e.key === '.') && e.preventDefault()}
                  value={variantEditForm.quantity}
                  onChange={(e) =>
                    handleVariantFormChange("quantity", e.target.value)
                  }
                  placeholder="0"
                />
              </div>
            </div>
            
          </div>
          <div className="space-y-4 mt-6">
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-gray-700">
                  Combination Gallery
                </span>
              </div>
              <Uploader
                product
                folder="product"
                imageUrl={variantGallery}
                setImageUrl={setVariantGallery}
              />
              {/* Combination / Variant video URL (stored inside variantGallery array) */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Combination Video URL
                </label>
                <Input
                  type="text"
                  placeholder="https://example.com/video.mp4"
                  value={
                    Array.isArray(variantGallery)
                      ? variantGallery.find(
                          (item) => typeof item === "string" && isVideoUrl(item)
                        )|| ""
                      : ""
                  }
                  onChange={(e) => {
                    const url = e.target.value.trim();
                    const isVideo = isVideoUrl(url);

                    setVariantGallery((prev = []) => {
                      const prevArray = Array.isArray(prev)
                        ? prev
                        : prev
                        ? [prev]
                        : [];
                      const filtered = prevArray.filter(
                        (item) =>
                          !(typeof item === "string" && isVideoUrl(item))
                      );

                      if (!isVideo) {
                        return filtered;
                      }

                      return [...filtered, url];
                    });
                  }}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Only video URLs (.mp4, .mov, .webm). Stored together with combination images.
                </p>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-700">
                  Dynamic Sections
                </span>
                <Button
                  size="small"
                  type="button"
                  onClick={handleVariantAddDynamicSection}
                >
                  Add Section
                </Button>
              </div>
              {variantDynamicSectionsState?.length === 0 && (
                <p className="text-sm text-gray-500">
                  No sections yet. Add one to customize this combination.
                </p>
              )}
              <div className="space-y-4">
                {variantDynamicSectionsState?.map((section, sectionIndex) => (
                  <div
                    key={`variant-dynamic-${sectionIndex}`}
                    className="border border-gray-200 rounded-md p-3 bg-white"
                  >
                    <div className="flex gap-3 mb-3">
                      <Input
                        value={section.name}
                        onChange={(e) =>
                          handleVariantDynamicSectionChange(
                            sectionIndex,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Section name"
                      />
                      <button
                        type="button"
                        className="p-2 text-gray-500 hover:text-red-600 focus:outline-none"
                        onClick={() =>
                          handleVariantRemoveDynamicSection(sectionIndex)
                        }
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    <Textarea
                      className="mb-4"
                      rows="2"
                      value={section.description || ""}
                      onChange={(e) =>
                        handleVariantDynamicSectionChange(
                          sectionIndex,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Section description"
                    />
                    <div className="space-y-3">
                      {section.subsections?.map((subsection, subsectionIndex) => (
                        <div
                          key={`variant-sub-${sectionIndex}-${subsectionIndex}`}
                          className="border border-gray-100 rounded-md p-3"
                        >
                          <div className="flex gap-3 mb-2">
                            <select
                              value={subsection.type || "keyValue"}
                              onChange={(e) =>
                                handleVariantSubsectionTypeChange(
                                  sectionIndex,
                                  subsectionIndex,
                                  e.target.value
                                )
                              }
                              className="block w-full rounded-md border border-gray-200 focus:border-store-500 focus:ring-0 text-sm h-11"
                            >
                              <option value="keyValue">Key / Value</option>
                              <option value="paragraph">Paragraph</option>
                            </select>
                            <button
                              type="button"
                              className="p-2 text-gray-500 hover:text-red-600 focus:outline-none"
                              onClick={() =>
                                handleVariantRemoveSubsection(
                                  sectionIndex,
                                  subsectionIndex
                                )
                              }
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                          {subsection.type === "paragraph" ? (
                            <Textarea
                              rows="3"
                              value={subsection.content || ""}
                              onChange={(e) =>
                                handleVariantSubsectionChange(
                                  sectionIndex,
                                  subsectionIndex,
                                  "content",
                                  e.target.value
                                )
                              }
                              placeholder="Paragraph content"
                            />
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <Input
                                value={subsection.key || ""}
                                onChange={(e) =>
                                  handleVariantSubsectionChange(
                                    sectionIndex,
                                    subsectionIndex,
                                    "key",
                                    e.target.value
                                  )
                                }
                                placeholder="Key"
                              />
                              <Input
                                value={subsection.value || ""}
                                onChange={(e) =>
                                  handleVariantSubsectionChange(
                                    sectionIndex,
                                    subsectionIndex,
                                    "value",
                                    e.target.value
                                  )
                                }
                                placeholder="Value"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-3">
                      <Button
                        size="small"
                        type="button"
                        onClick={() =>
                          handleVariantAddSubsection(sectionIndex, "keyValue")
                        }
                      >
                        Add Key / Value
                      </Button>
                      <Button
                        size="small"
                        type="button"
                        onClick={() =>
                          handleVariantAddSubsection(sectionIndex, "paragraph")
                        }
                      >
                        Add Paragraph
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-700">
                  Media Sections
                </span>
                <Button
                  size="small"
                  type="button"
                  onClick={handleVariantAddMediaSection}
                >
                  Add Media Section
                </Button>
              </div>
              {variantMediaSectionsState?.length === 0 && (
                <p className="text-sm text-gray-500">
                  No media sections yet. Add one to describe instructions,
                  benefits, etc. per combination.
                </p>
              )}
              <div className="space-y-4">
                {variantMediaSectionsState?.map((section, sectionIndex) => (
                  <div
                    key={`variant-media-${sectionIndex}`}
                    className="border border-gray-200 rounded-md p-3 bg-white"
                  >
                    <div className="flex gap-3 mb-3">
                      <Input
                        value={section.name}
                        onChange={(e) =>
                          handleVariantMediaSectionChange(
                            sectionIndex,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Section name"
                      />
                      <button
                        type="button"
                        className="p-2 text-gray-500 hover:text-red-600 focus:outline-none"
                        onClick={() =>
                          handleVariantRemoveMediaSection(sectionIndex)
                        }
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    <Textarea
                      rows="2"
                      className="mb-3"
                      value={section.description || ""}
                      onChange={(e) =>
                        handleVariantMediaSectionChange(
                          sectionIndex,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Section description"
                    />
                    <div className="space-y-3">
                      {section.items?.map((item, itemIndex) => (
                        <div
                          key={`variant-media-item-${sectionIndex}-${itemIndex}`}
                          className="border border-gray-100 rounded-md p-3"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-semibold">
                              Item {itemIndex + 1}
                            </span>
                            <button
                              type="button"
                              className="p-2 text-gray-500 hover:text-red-600 focus:outline-none"
                              onClick={() =>
                                handleVariantRemoveMediaItem(
                                  sectionIndex,
                                  itemIndex
                                )
                              }
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                          <div className="mb-3">
                            <Uploader
                              product={false}
                              folder="product-media"
                              imageUrl={item.image}
                              setImageUrl={(url) =>
                                handleVariantMediaItemChange(
                                  sectionIndex,
                                  itemIndex,
                                  "image",
                                  url
                                )
                              }
                            />
                          </div>
                          <Textarea
                            rows="2"
                            value={item.details || ""}
                            onChange={(e) =>
                              handleVariantMediaItemChange(
                                sectionIndex,
                                itemIndex,
                                "details",
                                e.target.value
                              )
                            }
                            placeholder="Details / instructions"
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      size="small"
                      type="button"
                      className="mt-3"
                      onClick={() => handleVariantAddMediaItem(sectionIndex)}
                    >
                      Add Item
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button layout="outline" type="button" className="max-w-54" onClick={handleVariantEditClose}>
              Cancel
            </Button>
            <Button type="button" className="w-full" onClick={handleVariantEditSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quick Create Brand Modal */}
      <Modal
        open={isQuickBrandOpen}
        onClose={() => {
          setIsQuickBrandOpen(false);
          setQuickBrandName("");
        }}
        classNames={{ modal: "rounded-lg" }}
        center
      >
        <div className="w-full max-w-md p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Create Brand</h3>
          <p className="text-sm text-gray-600 mb-4">
            Create a new brand quickly. You can add logo, cover image, and other details later from the Brands page.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={quickBrandName}
                onChange={(e) => setQuickBrandName(e.target.value)}
                placeholder="Enter brand name"
                className="w-full"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              layout="outline"
              type="button"
              className="max-w-54"
              onClick={() => {
                setIsQuickBrandOpen(false);
                setQuickBrandName("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="w-full"
              onClick={handleQuickCreateBrand}
            >
              Create Brand
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Variants Modal with Checkboxes */}
      <Modal
        open={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewVariants([]);
          setSelectedPreviewVariants([]);
        }}
        center
        classNames={{ modal: "rounded-lg" }}
        closeIcon={
          <div className="absolute top-0 right-0 text-red-500 active:outline-none text-xl border-0">
            <FiX className="text-3xl" />
          </div>
        }
      >
        <div className="w-full max-w-4xl p-4">
          <h3 className="text-lg font-semibold mb-4">Select Variants to Create</h3>
          <p className="text-sm text-gray-600 mb-4">
            {previewVariants.length} variant(s) generated. Select which ones to create.
          </p>
          
          <div className="flex items-center justify-between mb-4 pb-3 border-b">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={
                  previewVariants.length > 0 &&
                  selectedPreviewVariants.length === previewVariants.length
                }
                onChange={handleSelectAllPreviewVariants}
                className="mr-2 w-4 h-4"
              />
              <span className="text-sm font-medium">
                Select All ({selectedPreviewVariants.length}/{previewVariants.length})
              </span>
            </label>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 mb-4">
            {previewVariants.map((previewVariant, index) => {
              // Build combination label from attributes
              const combinationLabel = buildCombinationLabel(previewVariant);
              const isSelected = selectedPreviewVariants.includes(index);
              
              return (
                <div
                  key={index}
                  className={`border rounded-lg p-3 flex items-start ${
                    isSelected
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleTogglePreviewVariant(index)}
                    className="mt-1 mr-3 w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">
                      {combinationLabel || `Variant ${index + 1}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      SKU: {previewVariant.sku || "N/A"} | Price: {currency}
                      {previewVariant.price || 0}
                    </div>
                    {variantTitle?.length > 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        {variantTitle
                          ?.map((att) => {
                            const valueId = previewVariant[att._id];
                            if (!valueId) return null;
                            const option = att?.variants?.find(
                              (opt) => opt._id === valueId
                            );
                            if (!option) return null;
                            const optionName =
                              typeof option.name === "object"
                                ? showingTranslateValue(option.name)
                                : option.name;
                            return `${showingTranslateValue(att?.title)}: ${optionName}`;
                          })
                          ?.filter(Boolean)
                          .join(" | ")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              layout="outline"
              type="button"
              onClick={() => {
                setShowPreviewModal(false);
                setPreviewVariants([]);
                setSelectedPreviewVariants([]);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateSelectedVariants}
              disabled={selectedPreviewVariants.length === 0}
            >
              Create Selected ({selectedPreviewVariants.length})
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quick Create Tax Modal */}
      <Modal
        open={isQuickTaxOpen}
        onClose={() => {
          setIsQuickTaxOpen(false);
          setQuickTaxName("");
          setQuickTaxRate("");
        }}
        classNames={{ modal: "rounded-lg" }}
        center
      >
        <div className="w-full max-w-md p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Add Tax</h3>
          <p className="text-sm text-gray-600 mb-4">
            Create a new tax rate quickly. You can manage all taxes from the Taxes page.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Tax Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={quickTaxName}
                onChange={(e) => setQuickTaxName(e.target.value)}
                placeholder="e.g. GST 18%"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Rate (%) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                onKeyDown={(e) => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                value={quickTaxRate}
                onChange={(e) => setQuickTaxRate(e.target.value)}
                placeholder="18"
                className="w-full"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              layout="outline"
              type="button"
              className="max-w-54"
              onClick={() => {
                setIsQuickTaxOpen(false);
                setQuickTaxName("");
                setQuickTaxRate("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="w-full"
              onClick={handleQuickCreateTax}
            >
              Create Tax
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quick Create Sub-Category Modal */}
      <Modal
        open={isQuickCategoryOpen}
        onClose={() => {
          setIsQuickCategoryOpen(false);
          setQuickCategoryName("");
        }}
        classNames={{ modal: "rounded-lg" }}
        center
      >
        <div className="w-full max-w-md p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Add Sub-Category</h3>
          <p className="text-sm text-gray-600 mb-4">
            Create a new sub-category under <strong>{defaultCategory?.[0] ? showingTranslateValue(defaultCategory[0].name) : selectedCategory?.[0] ? showingTranslateValue(selectedCategory[0].name) : "selected category"}</strong>. You can add icon, description, and other details later from the Categories page.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Sub-Category Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={quickCategoryName}
                onChange={(e) => setQuickCategoryName(e.target.value)}
                placeholder="Enter sub-category name"
                className="w-full"
              />
            </div>
            {(!defaultCategory?.[0] && !selectedCategory?.[0]) && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                ⚠️ Please select a parent category first from the Category section above.
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              layout="outline"
              type="button"
              className="max-w-54"
              onClick={() => {
                setIsQuickCategoryOpen(false);
                setQuickCategoryName("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="w-full"
              onClick={handleQuickCreateCategory}
              disabled={!defaultCategory?.[0] && !selectedCategory?.[0]}
            >
              Create Sub-Category
            </Button>
          </div>
        </div>
      </Modal>

      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {id ? (
          <Title
            register={register}
            handleSelectLanguage={handleSelectLanguage}
            title={t("UpdateProduct")}
            description={t("UpdateProductDescription")}
          />
        ) : (
          <Title
            register={register}
            handleSelectLanguage={handleSelectLanguage}
            title={t("DrawerAddProduct")}
            description={t("AddProductDescription")}
          />
        )}
      </div>

      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-700">
        <SwitchToggleForCombination
          product
          handleProcess={handleIsCombination}
          processOption={isCombination}
        />

        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <ActiveButton
              tapValue={tapValue}
              activeValue="Basic Info"
              handleProductTap={handleProductTap}
            />
          </li>

          {isCombination && (
            <li className="mr-2">
              <ActiveButton
                tapValue={tapValue}
                activeValue="Combination"
                handleProductTap={handleProductTap}
              />
            </li>
          )}
        </ul>
      </div>

      <Scrollbars className="track-horizontal thumb-horizontal w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-gray-700 dark:text-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="block" id="productForm">
          {tapValue === "Basic Info" && (
            <div className="px-6 pt-8 flex-grow w-full h-full max-h-full pb-40 md:pb-32 lg:pb-32 xl:pb-32 space-y-8">
              
              {/* SECTION 1 — BASIC INFORMATION */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                <h3 className="text-md font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-2">
                  Section 1: Basic Information
                </h3>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Product Name *" />
                  <div className="col-span-8 sm:col-span-4">
                    <Input
                      {...register("title", { required: "Product Name is required!" })}
                      placeholder="e.g. Nike Air Max 90"
                      onBlur={(e) => handleProductSlug(e.target.value)}
                    />
                    <Error errorName={errors.title} />
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Slug (Auto Generate) *" />
                  <div className="col-span-8 sm:col-span-4">
                    <Input
                      {...register("slug", { required: "Slug is required!" })}
                      defaultValue={slug}
                      placeholder="nike-air-max-90"
                    />
                    <Error errorName={errors.slug} />
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Product Type *" />
                  <div className="col-span-8 sm:col-span-4">
                    <select
                      {...register("productType", { required: "Product Type is required!" })}
                      className="block w-full rounded-md border border-gray-200 focus:border-store-500 focus:ring-0 text-sm h-12 dark:bg-gray-700 dark:text-gray-200"
                    >
                      <option value="">Choose Type</option>
                      <option value="Sneakers">Sneakers</option>
                      <option value="Bags">Bags</option>
                      <option value="Slides">Slides</option>
                      <option value="Heels">Heels</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                    <Error errorName={errors.productType} />
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Gender *" />
                  <div className="col-span-8 sm:col-span-4">
                    <select
                      {...register("gender", { required: "Gender is required!" })}
                      className="block w-full rounded-md border border-gray-200 focus:border-store-500 focus:ring-0 text-sm h-12 dark:bg-gray-700 dark:text-gray-200"
                    >
                      <option value="">Choose Gender</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                    <Error errorName={errors.gender} />
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Short Description *" />
                  <div className="col-span-8 sm:col-span-4">
                    <Textarea
                      {...register("description", { required: "Short description is required!" })}
                      rows="2"
                      placeholder="Provide a quick summary of the product."
                    />
                    <Error errorName={errors.description} />
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Full Description" />
                  <div className="col-span-8 sm:col-span-4">
                    <Textarea
                      {...register("highlights")}
                      rows="4"
                      placeholder="Detailed product information."
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2 — MEDIA */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                <h3 className="text-md font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-2">
                  Section 2: Media
                </h3>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Featured Image" />
                  <div className="col-span-8 sm:col-span-4">
                    <Uploader
                      product={false}
                      folder="product"
                      imageUrl={featuredImage ? [featuredImage] : []}
                      setImageUrl={(url) => setFeaturedImage(Array.isArray(url) ? url[0] : (url || ""))}
                      useOriginalSize={true}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Hover Image" />
                  <div className="col-span-8 sm:col-span-4">
                    <Uploader
                      product={false}
                      folder="product"
                      imageUrl={hoverImage ? [hoverImage] : []}
                      setImageUrl={(url) => setHoverImage(Array.isArray(url) ? url[0] : (url || ""))}
                      useOriginalSize={true}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Gallery Images" />
                  <div className="col-span-8 sm:col-span-4">
                    <Uploader
                      product={true}
                      folder="product"
                      imageUrl={imageUrl}
                      setImageUrl={setImageUrl}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Product Video URL" />
                  <div className="col-span-8 sm:col-span-4">
                    <Input
                      value={video}
                      onChange={(e) => setVideo(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3 — PRODUCT ORGANIZATION */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                <h3 className="text-md font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-2">
                  Section 3: Product Organization
                </h3>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Brand *" />
                  <div className="col-span-8 sm:col-span-4">
                    <select
                      value={brand?._id || ""}
                      onChange={(e) => {
                        const selected = brandOptions?.find((item) => item._id === e.target.value);
                        setBrand(selected || null);
                      }}
                      className="block w-full rounded-md border border-gray-200 focus:border-store-500 focus:ring-0 text-sm h-12 dark:bg-gray-700 dark:text-gray-200"
                    >
                      <option value="">Select Brand</option>
                      {brandOptions?.map((item) => (
                        <option key={item._id} value={item._id}>
                          {showingTranslateValue(item.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Category *" />
                  <div className="col-span-8 sm:col-span-4">
                    <ParentCategory
                      lang={language}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      setDefaultCategory={setDefaultCategory}
                      defaultCategory={defaultCategory}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Product Badge" />
                  <div className="col-span-8 sm:col-span-4">
                    <select
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="block w-full rounded-md border border-gray-200 focus:border-store-500 focus:ring-0 text-sm h-12 dark:bg-gray-700 dark:text-gray-200"
                    >
                      <option value="">No Badge</option>
                      <option value="New">New</option>
                      <option value="Trending">Trending</option>
                      <option value="Best Seller">Best Seller</option>
                      <option value="Limited Edition">Limited Edition</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 4 — PRICING */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                <h3 className="text-md font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-2">
                  Section 4: Pricing
                </h3>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="MRP (₹) *" />
                  <div className="col-span-8 sm:col-span-4">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      onKeyDown={(e) => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                      {...register("originalPrice", { required: "MRP is required!" })}
                      placeholder="0"
                    />
                    <Error errorName={errors.originalPrice} />
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Selling Price (₹) *" />
                  <div className="col-span-8 sm:col-span-4">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      onKeyDown={(e) => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                      {...register("price", { required: "Selling Price is required!" })}
                      placeholder="0"
                    />
                    <Error errorName={errors.price} />
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Sale Price (Optional)" />
                  <div className="col-span-8 sm:col-span-4">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      onKeyDown={(e) => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                      {...register("salePrice")}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5 — INVENTORY & STATUS */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                <h3 className="text-md font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-2">
                  Section 5: Inventory
                </h3>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Total Stock *" />
                  <div className="col-span-8 sm:col-span-4">
                    <Input
                      type="number"
                      min="0"
                      {...register("stock", {
                        required: variants?.length ? false : "Stock is required!",
                        min: { value: 0, message: "Stock cannot be negative" },
                      })}
                      placeholder="e.g. 50"
                    />
                    <Error errorName={errors.stock} />
                    <p className="text-xs text-gray-500 mt-1">
                      {variants?.length > 0
                        ? "Using color/size variants? Set qty per UK size in the Combination tab."
                        : "Total units available on the storefront."}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Base SKU" />
                  <div className="col-span-8 sm:col-span-4">
                    <Input
                      {...register("sku")}
                      placeholder="e.g. NIKE-AM90-BLK"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Low Stock Alert *" />
                  <div className="col-span-8 sm:col-span-4">
                    <Input
                      type="number"
                      min="0"
                      {...register("lowStockAlert")}
                      placeholder="e.g. 5"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Status" />
                  <div className="col-span-8 sm:col-span-4">
                    <select
                      {...register("status")}
                      className="block w-full rounded-md border border-gray-200 focus:border-store-500 focus:ring-0 text-sm h-12 dark:bg-gray-700 dark:text-gray-200"
                    >
                      <option value="Published">Published (Live on store)</option>
                      <option value="Draft">Draft</option>
                      <option value="Hidden">Hidden</option>
                      <option value="Out Of Stock">Out Of Stock</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 7 — SEO */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                <h3 className="text-md font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-2">
                  Section 7: SEO
                </h3>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Meta Title" />
                  <div className="col-span-8 sm:col-span-4">
                    <Input
                      {...register("metaTitle")}
                      placeholder="Meta listing title"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="Meta Description" />
                  <div className="col-span-8 sm:col-span-4">
                    <Textarea
                      {...register("metaDescription")}
                      rows="3"
                      placeholder="Meta listing description"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6">
                  <LabelArea label="SEO Image" />
                  <div className="col-span-8 sm:col-span-4">
                    <Uploader
                      product={false}
                      folder="seo"
                      imageUrl={seoImage ? [seoImage] : []}
                      setImageUrl={(urls) => setSeoImage(urls?.[0] || "")}
                      useOriginalSize={true}
                    />
                  </div>
                </div>
              </div>

              {/* HOMEPAGE PLACEMENT */}
              <div className="space-y-4">
                <ProductPlacementFlags tag={tag} setTag={setTag} />
              </div>

              {/* LIVE CARD PREVIEW */}
              <div className="mt-8">
                <ProductPreviewCard
                  title={watch("title")}
                  brandName={brand ? (brand.name?.en || brand.name) : ""}
                  originalPrice={watch("originalPrice")}
                  discount={Number(watch("originalPrice") || 0) - (Number(watch("salePrice")) || Number(watch("price")) || Number(watch("originalPrice") || 0))}
                  discountType="flat"
                  badge={badge}
                  featuredImage={featuredImage}
                  hoverImage={hoverImage}
                />
              </div>
            </div>
          )}

          {tapValue === "Combination" && isCombination && (
            <div className="p-6">
              <ColorVariantManager
                variants={variants}
                setVariants={setVariants}
                watch={watch}
              />
            </div>
          )}

          {isCombination ? (
            <DrawerButton
              id={id}
              save
              title="Product"
              isSubmitting={isSubmitting}
              handleProductTap={handleProductTap}
            />
          ) : (
            <DrawerButton id={id} title="Product" isSubmitting={isSubmitting} />
          )}

          {tapValue === "Combination" && (
            <DrawerButton id={id} title="Product" isSubmitting={isSubmitting} />
          )}
        </form>
      </Scrollbars>
    </>
  );
};

export default React.memo(ProductDrawer);
