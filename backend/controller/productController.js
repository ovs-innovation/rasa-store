const Product = require("../models/Product");
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Setting = require("../models/Setting");
const UserProductView = require("../models/UserProductView");
const { languageCodes } = require("../utils/data");
const { formatProductForCSV,
  formatCSVToProduct,
} = require("../utils/productCsvFormatter");

const normalizeProductStatus = (status) => {
  const map = {
    Published: "show",
    published: "show",
    show: "show",
    Hidden: "hide",
    hidden: "hide",
    hide: "hide",
    Draft: "draft",
    draft: "draft",
    "Out Of Stock": "out-of-stock",
    "out-of-stock": "out-of-stock",
  };
  return map[status] || status || "show";
};

const normalizeImageList = (val) => {
  if (!val) return [];
  const source = Array.isArray(val)
    ? val
    : typeof val === "string" && val.trim()
    ? [val]
    : [];
  return source
    .flat(Infinity)
    .filter((item) => typeof item === "string" && item.trim())
    .map((item) => item.trim());
};

const pickFirstImageUrl = (val) => {
  const list = normalizeImageList(val);
  return list[0] || "";
};

const resolveBrandQueryId = async (brandParam) => {
  if (!brandParam) return null;

  const raw = decodeURIComponent(String(brandParam)).trim();
  if (!raw) return null;

  if (mongoose.Types.ObjectId.isValid(raw)) {
    const byId = await Brand.findOne({ _id: raw, status: "show" }).select("_id");
    if (byId) return byId._id;
  }

  const slugCandidates = [
    raw,
    raw.toLowerCase(),
    raw.replace(/\s+/g, "-").toLowerCase(),
  ];

  const bySlug = await Brand.findOne({
    slug: { $in: [...new Set(slugCandidates)] },
    status: "show",
  }).select("_id");

  if (bySlug) return bySlug._id;

  const label = raw.replace(/[-_]+/g, " ").trim();
  if (!label) return null;

  const nameQueries = languageCodes.map((lang) => ({
    [`name.${lang}`]: { $regex: `^${label}$`, $options: "i" },
  }));

  const byName = await Brand.findOne({
    $or: nameQueries,
    status: "show",
  }).select("_id");

  return byName?._id || null;
};

const normalizeProductMediaFields = (body = {}) => {
  const gallery = normalizeImageList(body.image);
  const featured =
    pickFirstImageUrl(body.featuredImage) || gallery[0] || "";
  const hover =
    pickFirstImageUrl(body.hoverImage) || gallery[1] || gallery[0] || "";

  return {
    image: gallery,
    featuredImage: featured,
    hoverImage: hover,
    thumbnail: pickFirstImageUrl(body.thumbnail) || featured,
    seoImage: pickFirstImageUrl(body.seoImage) || featured,
  };
};

const normalizePricesPayload = (prices = {}) => {
  const originalPrice = Math.max(0, Number(prices.originalPrice) || 0);
  const discount = Math.max(0, Number(prices.discount) || 0);
  const discountType = prices.discountType || "flat";
  
  // If salePrice is explicitly provided and valid, prioritize it as the final customer-facing price
  const salePriceVal = Number(prices.salePrice);
  const explicitPrice = (Number.isFinite(salePriceVal) && salePriceVal > 0)
    ? salePriceVal
    : Number(prices.price);

  let price;
  if (Number.isFinite(explicitPrice) && explicitPrice >= 0) {
    price = explicitPrice;
  } else if (discountType === "percentage") {
    price = Math.max(0, originalPrice - (originalPrice * discount) / 100);
  } else {
    price = Math.max(0, originalPrice - discount);
  }

  return {
    ...prices,
    originalPrice,
    discount,
    discountType,
    price,
    salePrice:
      prices.salePrice !== undefined && prices.salePrice !== null
        ? Math.max(0, Number(prices.salePrice) || 0)
        : price,
  };
};

const flattenVariants = (variants) => {
  if (!Array.isArray(variants) || variants.length === 0) return [];
  
  const isNested = variants.some(v => v && typeof v === "object" && (Array.isArray(v.sizes) || v.sizes));
  if (!isNested) return variants;
  
  const flat = [];
  variants.forEach((colorVar) => {
    if (!colorVar) return;
    const color = colorVar.color || colorVar.colorName || "";
    const images = colorVar.images || [];
    const thumbnail = colorVar.thumbnail || "";
    const basePrice = colorVar.price;
    const baseOriginalPrice = colorVar.originalPrice;
    const baseSku = colorVar.sku || "";
    
    const sizes = colorVar.sizes || [];
    sizes.forEach((sizeVar) => {
      if (!sizeVar) return;
      const size = sizeVar.size || "";
      const quantity = typeof sizeVar.quantity === "number" ? sizeVar.quantity : Number(sizeVar.stock || 0);
      const sku = sizeVar.sku || (baseSku ? `${baseSku}-${size.replace(/\s+/g, "")}` : "");
      const price = typeof sizeVar.price === "number" ? sizeVar.price : basePrice;
      const originalPrice = typeof sizeVar.originalPrice === "number" ? sizeVar.originalPrice : baseOriginalPrice;
      
      flat.push({
        _id: sizeVar._id || `v-${color.toLowerCase()}-${size.replace(/\s+/g, "").toLowerCase()}`,
        color: color,
        size: size,
        price: price,
        originalPrice: originalPrice,
        quantity: quantity,
        sku: sku,
        images: images,
        thumbnail: thumbnail,
        combinationLabel: `${color} / ${size}`,
      });
    });
  });
  return flat;
};

const buildColorVariants = (variants) => {
  if (!Array.isArray(variants) || variants.length === 0) return [];

  const isNested = variants.some(
    (v) => v && typeof v === "object" && (Array.isArray(v.sizes) || v.sizes)
  );

  if (isNested) {
    return variants.filter(Boolean).map((colorVar, idx) => {
      const color = String(
        colorVar.color || colorVar.colorName || `Color ${idx + 1}`
      ).trim();
      const images = Array.isArray(colorVar.images)
        ? colorVar.images.filter((img) => typeof img === "string" && img.trim())
        : [];
      const thumbnail =
        (typeof colorVar.thumbnail === "string" && colorVar.thumbnail.trim()) ||
        images[0] ||
        "";

      const hasStock = (colorVar.sizes || []).some(
        (sizeVar) =>
          sizeVar?.enabled !== false &&
          Number(sizeVar?.quantity ?? sizeVar?.stock ?? 0) > 0
      );

      return { color, images, thumbnail, hasStock };
    });
  }

  const map = new Map();
  variants.forEach((variant) => {
    const color = String(variant.color || variant.colorName || "").trim();
    if (!color || map.has(color)) return;

    const images = Array.isArray(variant.images)
      ? variant.images.filter((img) => typeof img === "string" && img.trim())
      : [];
    map.set(color, {
      color,
      images,
      thumbnail:
        (typeof variant.thumbnail === "string" && variant.thumbnail.trim()) ||
        images[0] ||
        "",
      hasStock: variants.some(
        (v) =>
          String(v.color || v.colorName || "").trim() === color &&
          Number(v.quantity) > 0
      ),
    });
  });

  return Array.from(map.values());
};

const flattenProductVariants = (product) => {
  if (!product) return product;
  const productObj = typeof product.toObject === "function" ? product.toObject() : product;
  if (Array.isArray(productObj.variants) && productObj.variants.length > 0) {
    productObj.colorVariants = buildColorVariants(productObj.variants);
    productObj.variants = flattenVariants(productObj.variants);
  } else {
    productObj.colorVariants = [];
  }
  return productObj;
};

const normalizeTaxPayload = (payload = {}) => {
  const parsedRate =
    typeof payload.taxRate === "number"
      ? payload.taxRate
      : Number(payload.taxRate);
  return {
    taxRate: Number.isFinite(parsedRate) ? parsedRate : 0,
    hsnCode:
      typeof payload.hsnCode === "string" ? payload.hsnCode.trim() : "",
    isPriceInclusive: Boolean(payload.isPriceInclusive),
  };
};

const sanitizeDynamicSections = (sections = []) => {
  if (!Array.isArray(sections)) return [];

  return sections
    .filter(
      (section) =>
        section &&
        typeof section.name === "string" &&
        section.name.trim().length > 0
    )
    .map((section) => {
      const cleanedName = section.name.trim();
      const description =
        typeof section.description === "string" ? section.description : "";

      const subsections = Array.isArray(section.subsections)
        ? section.subsections
          .filter((subsection) => {
            if (!subsection) return false;
            if (subsection.type === "paragraph") {
              return Boolean(
                (subsection.content && subsection.content.trim()) ||
                (subsection.paragraph && subsection.paragraph.trim()) ||
                (subsection.value && subsection.value.trim()) ||
                (subsection.description && subsection.description.trim())
              );
            }
            // For keyValue type, check key, value, title, or content
            return Boolean(
              (subsection.key && subsection.key.trim()) ||
              (subsection.value && subsection.value.trim()) ||
              (subsection.title && subsection.title.trim()) ||
              (subsection.content && subsection.content.trim()));
          })
          .map((subsection) => {
            const type =
              subsection.type === "paragraph" ? "paragraph" : "keyValue";
            return {
              title:
                typeof subsection.title === "string"
                  ? subsection.title.trim()
                  : "",
              type,
              key:
                type === "keyValue" && typeof subsection.key === "string"
                  ? subsection.key.trim()
                  : "",
              value:
                type === "keyValue" && typeof subsection.value === "string"
                  ? subsection.value.trim()
                  : "",
              content:
                type === "paragraph"
                  ? (subsection.content || subsection.paragraph || "").trim()
                  : (subsection.content || "").trim(),
              description: typeof subsection.description === "string"
                ? subsection.description.trim()
                : "",
              isVisible: subsection?.isVisible !== false,
            };
          })
        : [];

      return {
        name: cleanedName,
        description,
        isVisible: section?.isVisible !== false,
        subsections,
      };
    });
};

const sanitizeMediaSections = (sections = []) => {
  if (!Array.isArray(sections)) return [];

  return sections
    .filter(
      (section) =>
        section &&
        typeof section.name === "string" &&
        section.name.trim().length > 0
    )
    .map((section) => {
      const cleanedName = section.name.trim();
      const description =
        typeof section.description === "string" ? section.description : "";

      const items = Array.isArray(section.items)
        ? section.items
          .filter(
            (item) =>
              item &&
              typeof item.image === "string" &&
              item.image.trim().length > 0 &&
              typeof item.details === "string" &&
              item.details.trim().length > 0
          )
          .map((item) => ({
            image: item.image.trim(),
            details: item.details.trim(),
          }))
        : [];

      return {
        name: cleanedName,
        description,
        isVisible: section?.isVisible !== false,
        items,
      };
    });
};

const sanitizeFaqs = (faqs = []) => {
  if (!Array.isArray(faqs)) return [];

  return faqs
    .filter(
      (faq) =>
        faq &&
        typeof faq.question === "string" &&
        faq.question.trim().length > 0
    )
    .map((faq) => {
      const question = faq.question.trim();
      const answerType =
        typeof faq.answerType === "string" &&
          ["yes", "no", "custom"].includes(faq.answerType.toLowerCase())
          ? faq.answerType.toLowerCase()
          : "yes";
      const customAnswer =
        answerType === "custom"
          ? typeof faq.customAnswer === "string" &&
            faq.customAnswer.trim().length > 0
            ? faq.customAnswer.trim()
            : typeof faq.answer === "string"
              ? faq.answer.trim()
              : ""
          : "";
      const answer =
        answerType === "custom"
          ? customAnswer
          : answerType === "yes"
            ? "Yes"
            : "No";

      if (!answer) {
        return null;
      }

      return {
        question,
        answerType,
        answer,
        isVisible: faq?.isVisible !== false,
      };
    })
    .filter(Boolean);
};

// Sanitize paragraphSectionSchema structure (for productDescription, howToUse, safetyInformation, composition, disclaimer)
const sanitizeParagraphSection = (section = {}, defaultTitle = "") => {
  if (Array.isArray(section) || (typeof section !== "object" || section === null)) {
    return {
      enabled: false,
      icon: "",
      title: defaultTitle,
      description: "",
    };
  }

  return {
    enabled: Boolean(section.enabled),
    icon: typeof section.icon === "string" ? section.icon.trim() : "",
    title:
      typeof section.title === "string" && section.title.trim()
        ? section.title.trim()
        : defaultTitle,
    description: typeof section.description === "string" ? section.description.trim() : "",
  };
};

// Sanitize listSectionSchema structure (for ingredients, keyUses, additionalInformation, faqs)
const sanitizeListSection = (section = {}, defaultTitle = "") => {
  if (Array.isArray(section) || (typeof section !== "object" || section === null)) {
    return {
      enabled: false,
      icon: "",
      title: defaultTitle,
      items: [],
    };
  }

  const items = Array.isArray(section.items)
    ? section.items
      .filter(
        (item) =>
          item &&
          (typeof item.key === "string" || typeof item.value === "string")
      )
      .map((item) => ({
        key: typeof item.key === "string" ? item.key.trim() : "",
        value: typeof item.value === "string" ? item.value.trim() : "",
      }))
    : [];

  return {
    enabled: Boolean(section.enabled),
    icon: typeof section.icon === "string" ? section.icon.trim() : "",
    title:
      typeof section.title === "string" && section.title.trim()
        ? section.title.trim()
        : defaultTitle,
    items,
  };
};

// Sanitize highlightSectionSchema structure (for productHighlights, manufacturerDetails)
const sanitizeHighlightSection = (section = {}, defaultTitle = "") => {
  if (Array.isArray(section) || (typeof section !== "object" || section === null)) {
    return {
      enabled: false,
      icon: "",
      title: defaultTitle,
      items: [],
    };
  }

  const items = Array.isArray(section.items)
    ? section.items
      .filter((item) => typeof item === "string" && item.trim().length > 0)
      .map((item) => item.trim())
    : [];

  return {
    enabled: Boolean(section.enabled),
    icon: typeof section.icon === "string" ? section.icon.trim() : "",
    title:
      typeof section.title === "string" && section.title.trim()
        ? section.title.trim()
        : defaultTitle,
    items,
  };
};

// Sanitize additionalInformationSectionSchema structure (with subsections)
const sanitizeAdditionalInformationSection = (section = {}, defaultTitle = "") => {
  if (Array.isArray(section) || (typeof section !== "object" || section === null)) {
    return {
      enabled: false,
      icon: "",
      title: defaultTitle,
      subsections: [],
    };
  }

  const subsections = Array.isArray(section.subsections)
    ? section.subsections
      .filter((subsection) => subsection && typeof subsection.label === "string" && subsection.label.trim().length > 0)
      .map((subsection) => {
        const items = Array.isArray(subsection.items)
          ? subsection.items
            .filter((item) => typeof item === "string" && item.trim().length > 0)
            .map((item) => item.trim())
          : [];

        return {
          label: subsection.label.trim(),
          items,
        };
      })
    : [];

  return {
    enabled: Boolean(section.enabled),
    icon: typeof section.icon === "string" ? section.icon.trim() : "",
    title:
      typeof section.title === "string" && section.title.trim()
        ? section.title.trim()
        : defaultTitle,
    subsections,
  };
};

// Sanitize FAQ section according to listSectionSchema structure
const sanitizeFaqSection = (faqSection = {}) => {
  return sanitizeListSection(faqSection, "FAQ");
};

const addProduct = async (req, res) => {
  try {
    if (req.body.prices) {
      req.body.prices = normalizePricesPayload(req.body.prices);
    }

    const taxFields = normalizeTaxPayload(req.body);

    const mediaFields = normalizeProductMediaFields(req.body);

    const payload = {
      ...req.body,
      ...taxFields,
      ...mediaFields,
      status: normalizeProductStatus(req.body.status),
      dynamicSections: sanitizeDynamicSections(req.body.dynamicSections),
      mediaSections: sanitizeMediaSections(req.body.mediaSections),
      faqs: sanitizeFaqSection(req.body.faqs),
      productDescription: sanitizeParagraphSection(req.body.productDescription, "Product Description"),
      disclaimer: sanitizeParagraphSection(req.body.disclaimer, "Disclaimer"),
      additionalInformation: sanitizeAdditionalInformationSection(req.body.additionalInformation, "Additional Information"),
      productHighlights: sanitizeHighlightSection(req.body.productHighlights, "Product Highlights"),
      manufacturerDetails: sanitizeHighlightSection(req.body.manufacturerDetails, "Manufacturer Details"),
      productId: req.body.productId
        ? req.body.productId
        : mongoose.Types.ObjectId(),
    };

    const newProduct = new Product(payload);

    await newProduct.save();
    res.send(newProduct);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const addAllProducts = async (req, res) => {
  try {
    // console.log('product data',req.body)
    await Product.deleteMany();
    const sanitizedDocs = req.body.map((doc) => ({
      ...doc,
      ...normalizeTaxPayload(doc),
    }));
    await Product.insertMany(sanitizedDocs);
    res.status(200).send({
      message: "Product Added successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getShowingProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "show" }).sort({ createdAt: -1 });
    const flattened = products.map(p => flattenProductVariants(p));
    res.send(flattened);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  const { title, category, price, page, limit, brand, status } = req.query;

  // console.log("getAllProducts");

  let queryObject = {};
  let sortObject = {};
  if (title) {
    const titleQueries = languageCodes.map((lang) => ({
      [`title.${lang}`]: { $regex: `${title}`, $options: "i" },
    }));
    queryObject.$or = titleQueries;
  }

  if (price === "low") {
    sortObject = {
      "prices.originalPrice": 1,
    };
  } else if (price === "high") {
    sortObject = {
      "prices.originalPrice": -1,
    };
  } else if (price === "date-added-asc") {
    sortObject.createdAt = 1;
  } else if (price === "date-added-desc") {
    sortObject.createdAt = -1;
  } else if (price === "date-updated-asc") {
    sortObject.updatedAt = 1;
  } else if (price === "date-updated-desc") {
    sortObject.updatedAt = -1;
  } else {
    sortObject = { createdAt: -1 };
  }

  if (status === "published") {
    queryObject.status = "show";
  } else if (status === "unPublished" || status === "unpublished") {
    queryObject.status = "hide";
  } else if (status === "selling") {
    queryObject.stock = { $gt: 0 };
  } else if (status === "out-of-stock") {
    queryObject.stock = { $lt: 1 };
  }

  // console.log('sortObject', sortObject);

  if (category) {
    queryObject.categories = category;
  }

  if (brand) {
    const brandId = await resolveBrandQueryId(brand);
    if (brandId) {
      queryObject.brand = brandId;
    }
  }

  const pages = Number(page);
  const limits = Number(limit);
  const skip = (pages - 1) * limits;

  try {
    const totalDoc = await Product.countDocuments(queryObject);

    const products = await Product.find(queryObject)
      .populate({ path: "category", select: "_id name" })
      .populate({ path: "categories", select: "_id name" })
      .populate({ path: "brand", select: "_id name slug logo" })
      .sort(sortObject)
      .skip(skip)
      .limit(limits);

    res.send({
      products,
      totalDoc,
      limits,
      pages,
    });
  } catch (err) {
    // console.log("error", err);
    res.status(500).send({
      message: err.message,
    });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: "show" });
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    res.send(flattenProductVariants(product));
  } catch (err) {
    res.status(500).send({
      message: `Slug problem, ${err.message}`,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({ path: "category", select: "_id name" })
      .populate({ path: "categories", select: "_id name" })
      .populate({ path: "brand", select: "_id name slug logo" });

    res.send(product);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateProduct = async (req, res) => {
  // console.log('update product')
  // console.log('variant',req.body.variants)
  try {
    if (req.body.prices) {
      req.body.prices = normalizePricesPayload(req.body.prices);
    }

    const product = await Product.findById(req.params.id);
    // console.log("product", product);

    if (product) {
      product.title = { ...product.title, ...req.body.title };
      product.description = {
        ...product.description,
        ...req.body.description,
      };
      product.highlights = {
        ...product.highlights,
        ...req.body.highlights,
      };
      if (typeof req.body.faqTitle === "string") {
        product.faqTitle = req.body.faqTitle.trim();
      }

      product.productId = req.body.productId;
      product.sku = req.body.sku;
      product.barcode = req.body.barcode;
      product.slug = req.body.slug;
      product.categories = req.body.categories;
      product.category = req.body.category;
      product.brand = req.body.brand;
      product.status = normalizeProductStatus(req.body.status || product.status);
      product.lowStockAlert = typeof req.body.lowStockAlert === "number" ? req.body.lowStockAlert : Number(req.body.lowStockAlert || 5);
      product.isCombination = req.body.isCombination;
      product.variants = req.body.variants;
      product.stock = req.body.stock;
      product.prices = req.body.prices;
      const mediaFields = normalizeProductMediaFields(req.body);
      product.image = mediaFields.image;
      product.tag = req.body.tag;
      product.gender = req.body.gender;
      product.productType = req.body.productType;
      product.metaTitle = req.body.metaTitle;
      product.metaDescription = req.body.metaDescription;
      product.seoImage = mediaFields.seoImage;
      product.featuredImage = mediaFields.featuredImage;
      product.hoverImage = mediaFields.hoverImage;
      product.badge = req.body.badge;

      const { hsnCode, taxRate, isPriceInclusive } = normalizeTaxPayload(
        req.body
      );
      product.hsnCode = hsnCode;
      product.taxRate = taxRate;
      product.isPriceInclusive = isPriceInclusive;
      product.variantFilters = req.body.variantFilters || [];
      if (Object.prototype.hasOwnProperty.call(req.body, "dynamicSections")) {
        product.dynamicSections = sanitizeDynamicSections(
          req.body.dynamicSections
        );
      }
      if (Object.prototype.hasOwnProperty.call(req.body, "mediaSections")) {
        product.mediaSections = sanitizeMediaSections(
          req.body.mediaSections
        );
      }
      if (Object.prototype.hasOwnProperty.call(req.body, "faqs")) {
        product.faqs = sanitizeFaqSection(req.body.faqs);
      }

      // Update new sections if provided
      if (Object.prototype.hasOwnProperty.call(req.body, "productDescription")) {
        product.productDescription = sanitizeParagraphSection(req.body.productDescription, "Product Description");
      }
      if (Object.prototype.hasOwnProperty.call(req.body, "additionalInformation")) {
        product.additionalInformation = sanitizeAdditionalInformationSection(req.body.additionalInformation, "Additional Information");
      }
      if (Object.prototype.hasOwnProperty.call(req.body, "productHighlights")) {
        product.productHighlights = sanitizeHighlightSection(req.body.productHighlights, "Product Highlights");
      }
      if (Object.prototype.hasOwnProperty.call(req.body, "manufacturerDetails")) {
        product.manufacturerDetails = sanitizeHighlightSection(req.body.manufacturerDetails, "Manufacturer Details");
      }
      if (Object.prototype.hasOwnProperty.call(req.body, "disclaimer")) {
        product.disclaimer = sanitizeParagraphSection(req.body.disclaimer, "Disclaimer");
      }

      await product.save();
      res.send({ data: product, message: "Product updated successfully!" });
    } else {
      res.status(404).send({
        message: "Product Not Found!",
      });
    }
  } catch (err) {
    console.error("updateProduct error:", err);
    res.status(400).send({
      message: err.message || "Failed to update product",
    });
  }
};

const updateManyProducts = async (req, res) => {
  try {
    const updatedData = {};
    for (const key of Object.keys(req.body)) {
      if (
        req.body[key] !== "[]" &&
        Object.entries(req.body[key]).length > 0 &&
        req.body[key] !== req.body.ids
      ) {
        // console.log('req.body[key]', typeof req.body[key]);
        updatedData[key] = req.body[key];
      }
    }

    // console.log("updated data", updatedData);

    await Product.updateMany(
      { _id: { $in: req.body.ids } },
      {
        $set: updatedData,
      },
      {
        multi: true,
      }
    );
    res.send({
      message: "Products update successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateStatus = (req, res) => {
  const newStatus = req.body.status;
  Product.updateOne(
    { _id: req.params.id },
    {
      $set: {
        status: newStatus,
      },
    },
    (err) => {
      if (err) {
        res.status(500).send({
          message: err.message,
        });
      } else {
        res.status(200).send({
          message: `Product ${newStatus} Successfully!`,
        });
      }
    }
  );
};

const deleteProduct = (req, res) => {
  Product.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      res.status(500).send({
        message: err.message,
      });
    } else {
      res.status(200).send({
        message: "Product Deleted Successfully!",
      });
    }
  });
};

const PRODUCT_POPULATE = [
  { path: "category", select: "name _id slug" },
  { path: "brand", select: "_id name slug logo coverImage" },
];

const fetchProductsByIds = async (ids = []) => {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length === 0) return [];

  const docs = await Product.find({ _id: { $in: validIds }, status: "show" }).populate(
    PRODUCT_POPULATE
  );
  const byId = new Map(docs.map((doc) => [String(doc._id), doc]));
  return validIds.map((id) => byId.get(String(id))).filter(Boolean);
};

const fetchProductsByPlacementTag = async (flag, sort, limit = 20) =>
  Product.find({ status: "show", tag: flag })
    .populate(PRODUCT_POPULATE)
    .sort(sort)
    .limit(limit);

const getShowingStoreProducts = async (req, res) => {
  // console.log("req.body", req);
  try {
    const queryObject = { status: "show" };

    // console.log("getShowingStoreProducts");

    const { category, title, slug, brand } = req.query;
    // console.log("title", title);

    // console.log("query", req);
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        queryObject.$or = [
          { category: category },
          { categories: { $in: [category] } },
        ];
      } else {
        try {
          const decoded = decodeURIComponent(category).toString();
          const categoryNameQueries = languageCodes.map((lang) => ({
            [`name.${lang}`]: { $regex: decoded.replace(/[-]+/g, " "), $options: "i" },
          }));
          const matchingCategories = await Category.find({
            $or: categoryNameQueries,
            status: "show",
          }).select("_id");

          if (matchingCategories && matchingCategories.length > 0) {
            const categoryIds = matchingCategories.map((c) => c._id);
            queryObject.$or = [
              { category: { $in: categoryIds } },
              { categories: { $in: categoryIds } },
            ];
          } else {
            const looseQueries = languageCodes.map((lang) => ({
              [`name.${lang}`]: { $regex: decoded, $options: "i" },
            }));
            const looseMatches = await Category.find({
              $or: looseQueries,
              status: "show",
            }).select("_id");
            if (looseMatches && looseMatches.length > 0) {
              const categoryIds = looseMatches.map((c) => c._id);
              queryObject.$or = [
                { category: { $in: categoryIds } },
                { categories: { $in: categoryIds } },
              ];
            }
          }
        } catch (err) {
          queryObject.$or = [
            { category: category },
            { categories: { $in: [category] } },
          ];
        }
      }
    }

    if (brand) {
      const brandId = await resolveBrandQueryId(brand);
      if (brandId) {
        queryObject.brand = brandId;
      }
    }

    if (title) {
      const titleQueries = languageCodes.map((lang) => ({
        [`title.${lang}`]: { $regex: `${title}`, $options: "i" },
      }));

      // Find brands matching the search query
      const brandNameQueries = languageCodes.map((lang) => ({
        [`name.${lang}`]: { $regex: `${title}`, $options: "i" },
      }));
      const matchingBrands = await Brand.find({
        $or: brandNameQueries,
        status: "show",
      }).select("_id");

      // Find categories matching the search query
      const categoryNameQueries = languageCodes.map((lang) => ({
        [`name.${lang}`]: { $regex: `${title}`, $options: "i" },
      }));
      const matchingCategories = await Category.find({
        $or: categoryNameQueries,
        status: "show",
      }).select("_id");

      // Build $or query for products
      const orConditions = [...titleQueries];

      // Add brand filter if matching brands found
      if (matchingBrands.length > 0) {
        const brandIds = matchingBrands.map((b) => b._id);
        orConditions.push({ brand: { $in: brandIds } });
      }

      // Add category filter if matching categories found
      if (matchingCategories.length > 0) {
        const categoryIds = matchingCategories.map((c) => c._id);
        orConditions.push({ category: { $in: categoryIds } });
        orConditions.push({ categories: { $in: categoryIds } });
      }

      queryObject.$or = orConditions;
    }

    let products = [];
    let popularProducts = [];
    let bestSellingProducts = [];
    let discountedProducts = [];
    let relatedProducts = [];
    let rasaHomepagePayload = null;

    if (slug) {
      queryObject.slug = slug;
      queryObject.status = "show";
      products = await Product.find(queryObject)
        .populate({ path: "category", select: "name _id" })
        .populate({ path: "brand", select: "_id name slug logo" })
        .sort({ createdAt: -1 })
        .limit(500);
      const currentProduct = products[0];
      if (currentProduct) {
        const currentId = currentProduct._id;
        const catId = currentProduct.category?._id || currentProduct.category;
        const relatedQuery = {
          _id: { $ne: currentId },
          status: "show",
        };
        if (catId) {
          relatedQuery.$or = [
            { category: catId },
            { categories: catId },
          ];
        }
        relatedProducts = await Product.find(relatedQuery)
          .populate({ path: "category", select: "_id name" })
          .populate({ path: "brand", select: "_id name slug logo" })
          .sort({ sales: -1, createdAt: -1 })
          .limit(12);
        if (!relatedProducts.length) {
          relatedProducts = await Product.find({
            _id: { $ne: currentId },
            status: "show",
          })
            .populate({ path: "category", select: "_id name" })
            .populate({ path: "brand", select: "_id name slug logo" })
            .sort({ sales: -1, createdAt: -1 })
            .limit(12);
        }
      }
    } else if (title || category || brand) {
      products = await Product.find(queryObject)
        .populate({ path: "category", select: "name _id" })
        .populate({ path: "brand", select: "_id name slug logo" })
        .sort({ createdAt: -1 })
        .limit(500);
    } else {
      // Fetch all products for the default view (e.g., /search page without filters)
      products = await Product.find({ status: "show" })
        .populate({ path: "category", select: "name _id" })
        .populate({ path: "brand", select: "_id name slug logo" })
        .sort({ createdAt: -1 })
        .limit(500);

      const settingDoc = await Setting.findOne({
        name: "storeCustomizationSetting",
      })
        .sort({ updatedAt: -1 })
        .lean();
      const rasaHomepage = settingDoc?.setting?.rasaHomepage || {};

      // New Arrivals — admin picks → tag fallback → newest
      popularProducts = await fetchProductsByIds(rasaHomepage.newArrivalProductIds);
      if (!popularProducts.length) {
        popularProducts = await fetchProductsByPlacementTag(
          "new-arrival",
          { createdAt: -1 },
          20
        );
      }
      if (!popularProducts.length) {
        popularProducts = await Product.find({ status: "show" })
          .populate(PRODUCT_POPULATE)
          .sort({ createdAt: -1 })
          .limit(20);
      }

      // Trending — admin picks → tag fallback → best sellers
      bestSellingProducts = await fetchProductsByIds(rasaHomepage.trendingProductIds);
      if (!bestSellingProducts.length) {
        bestSellingProducts = await fetchProductsByPlacementTag(
          "trending",
          { sales: -1 },
          20
        );
      }
      if (!bestSellingProducts.length) {
        bestSellingProducts = await Product.find({ status: "show" })
          .populate(PRODUCT_POPULATE)
          .sort({ sales: -1 })
          .limit(20);
      }

      rasaHomepagePayload = {
        brandsSectionEnabled: rasaHomepage.brandsSectionEnabled !== false,
        categoryBanners: (() => {
          const cms = rasaHomepage.categoryBanners || [];
          const defaults = [
            { type: "footwear", title: "Shoes", slug: "footwear", image: "/shoes3.png" },
            { type: "bags", title: "Bags", slug: "bags", image: "/bag1.png" },
          ];
          const footwear =
            cms.find((b) => b?.type === "footwear" || b?.slug === "footwear") || defaults[0];
          const bags =
            cms.find((b) => b?.type === "bags" || b?.slug === "bags") || defaults[1];
          const normalize = (banner, fallback) => ({
            type: banner?.type === "bags" ? "bags" : "footwear",
            title: String(banner?.title || fallback.title).trim(),
            slug: String(banner?.slug || fallback.slug).trim().toLowerCase(),
            image: String(banner?.image || fallback.image).trim(),
          });
          return [
            normalize({ ...footwear, type: "footwear" }, defaults[0]),
            normalize({ ...bags, type: "bags" }, defaults[1]),
          ];
        })(),
        instagramPosts: rasaHomepage.instagramPosts || [],
        heroSlides: (() => {
          const cms = rasaHomepage.heroSlides || [];
          const bagFallback = {
            type: "bags",
            title: "Bags & More",
            subtitle: "Bags & More",
            description:
              "Bags, accessories and latest styles — if you've seen it, chances are we've got it.",
            image: "/bag1.png",
            link: "/search?category=bags",
            brand: "Rasa",
            bgText: "BAGS",
            accentColor: "#B07A4F",
          };
          const shoeFallback = {
            type: "footwear",
            title: "Fresh Drops",
            subtitle: "Fresh Drops",
            description:
              "Affordable sneakers and streetwear — curated picks, delivered to your door.",
            image: "/shoes3.png",
            link: "/search?category=footwear",
            brand: "Rasa",
            bgText: "RASA",
            accentColor: "#D4AF37",
          };
          const isBag = (s) =>
            s?.type === "bags" ||
            /bag|duffle|backpack/i.test(
              `${s?.title || ""} ${s?.subtitle || ""} ${s?.link || ""} ${s?.image || ""}`
            );
          const isFootwear = (s) =>
            s?.type === "footwear" ||
            /footwear|shoe|sneaker/i.test(
              `${s?.title || ""} ${s?.subtitle || ""} ${s?.link || ""} ${s?.image || ""}`
            );

          if (cms.length >= 2) {
            const footwear = cms.find(isFootwear) || shoeFallback;
            const bags = cms.find(isBag) || bagFallback;
            return [footwear, bags];
          }
          if (!cms.length) return [shoeFallback, bagFallback];
          const merged = [...cms];
          if (!merged.some(isBag)) merged.push(bagFallback);
          if (!merged.some(isFootwear)) merged.unshift(shoeFallback);
          return merged.slice(0, 2);
        })(),
        heroSectionEnabled: rasaHomepage.heroSectionEnabled !== false,
        trendingSectionEnabled: rasaHomepage.trendingSectionEnabled !== false,
        newArrivalsSectionEnabled: rasaHomepage.newArrivalsSectionEnabled !== false,
        categoriesSectionEnabled: rasaHomepage.categoriesSectionEnabled !== false,
        footerSectionEnabled: rasaHomepage.footerSectionEnabled !== false,
        customerReviews: rasaHomepage.customerReviews || [],
        reviewsSection: rasaHomepage.reviewsSection || {
          enabled: true,
          eyebrow: "Reviews",
          title: "What Customers Say",
          subtitle: "Real feedback from shoppers who bought from Rasa Store.",
        },
        sectionOrder: (rasaHomepage.sectionOrder || ["Hero", "Brands", "New Arrival", "Trending", "Categories", "Reviews"])
          .filter((s) => s !== "Instagram")
          .map((s) => (s === "Newsletter" ? "Reviews" : s)),
      };

      discountedProducts = await Product.find({
        status: "show", // Ensure status "show" for discounted products
        $or: [
          {
            $and: [
              { isCombination: true },
              {
                variants: {
                  $elemMatch: {
                    discount: { $gt: "0.00" },
                  },
                },
              },
            ],
          },
          {
            $and: [
              { isCombination: false },
              {
                $expr: {
                  $gt: [
                    { $toDouble: "$prices.discount" }, // Convert the discount field to a double
                    0,
                  ],
                },
              },
            ],
          },
        ],
      })
        .populate({ path: "category", select: "name _id" })
        .populate({ path: "brand", select: "_id name slug logo" })
        .sort({ createdAt: -1 })
        .limit(20);
    }

    res.send({
      products: products.map(p => flattenProductVariants(p)),
      popularProducts: popularProducts.map(p => flattenProductVariants(p)),
      relatedProducts: relatedProducts.map(p => flattenProductVariants(p)),
      discountedProducts: discountedProducts.map(p => flattenProductVariants(p)),
      bestSellingProducts: bestSellingProducts.map(p => flattenProductVariants(p)),
      rasaHomepage: rasaHomepagePayload,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const deleteManyProducts = async (req, res) => {
  try {
    const cname = req.cname;
    // console.log("deleteMany", cname, req.body.ids);

    await Product.deleteMany({ _id: req.body.ids });

    res.send({
      message: `Products Delete Successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const addProductView = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user?._id;

    // If user is not logged in, we rely on frontend localStorage
    // The controller returns success so frontend code doesn't break
    if (!userId) {
      return res.status(200).json({
        success: true,
        message: "Guest view (handled by client)",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // 1. Validate Product Exists & Get Category
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 2. Prevent Duplicate Views (24 Hours Logic)
    // We check if this user viewed this product in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const existingView = await UserProductView.findOne({
      userId,
      productId,
      viewedAt: { $gte: twentyFourHoursAgo },
    });

    if (existingView) {
      // Update the existing view time to now, but strictly speaking
      // for "duplicate prevention", we might just want to acknowledge it.
      // Updating keeps "most recently viewed" accurate.
      existingView.viewedAt = Date.now();
      await existingView.save();
      return res.status(200).json({
        success: true,
        message: "Product view updated",
      });
    }

    // 3. Create New View Record
    // We store the category to help with "Recommended" queries later
    await UserProductView.create({
      userId,
      productId,
      category: product.category, // Assuming direct relationship or use product.categories[0]
    });

    res.status(200).json({
      success: true,
      message: "Product view tracked successfully",
    });
  } catch (err) {
    // console.log("addProductView Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const userId = req.user?._id;
    // Allow frontend to pass guest history via body (POST) or query (GET)
    let guestProductIds = req.body.guestProductIds;

    // If using GET, parsing query params (expecting comma separated string)
    if (!guestProductIds && req.query.productIds) {
      guestProductIds = req.query.productIds.split(',');
    }

    let seedProducts = [];
    let viewedIds = [];

    // 1. Gather Seed Data (User History)
    if (userId) {
      // Fetch last 10 viewed user history
      const views = await UserProductView.find({ userId })
        .sort({ viewedAt: -1 })
        .limit(10)
        .populate("productId", "category brand");

      // Filter out any products that might have been deleted but still in history
      seedProducts = views
        .map((v) => v.productId)
        .filter((p) => p != null);

      viewedIds = seedProducts.map((p) => p._id);
    }

    // If guest or limited history, combine with guestProductIds provided by frontend
    if (guestProductIds && Array.isArray(guestProductIds) && guestProductIds.length > 0) {
      const guestProds = await Product.find({
        _id: { $in: guestProductIds },
        status: "show",
      }).select("category brand");

      seedProducts = [...seedProducts, ...guestProds];
      viewedIds = [...viewedIds, ...guestProds.map(p => p._id)];
    }

    // 2. Fallback: If absolutely no history, return Top Selling / Popular
    if (seedProducts.length === 0) {
      const fallbackProducts = await Product.find({ status: "show" })
        .sort({ sales: -1 }) // sort by sales descending
        .limit(10);
      return res.status(200).json(fallbackProducts);
    }

    // 3. Extract Categories and Brands for Finding Similar Items
    // Using Set to get unique values
    const categories = [
      ...new Set(
        seedProducts.map((p) => p.category?.toString()).filter(Boolean)
      ),
    ];
    const brands = [
      ...new Set(seedProducts.map((p) => p.brand?.toString()).filter(Boolean)),
    ];

    // 4. Find Recommended Products
    // Rule: Same Category OR Same Brand, excluding the ones already viewed
    const recommendations = await Product.find({
      status: "show",
      _id: { $nin: viewedIds }, // Don't show what they just looked at
      $or: [
        { category: { $in: categories } },
        { brand: { $in: brands } },
      ],
    })
      .limit(10)
      .sort({ sales: -1 }); // Rank by popularity among similar items

    // 5. Fill functionality (if < 10 recommendations found)
    if (recommendations.length < 10) {
      const limit = 10 - recommendations.length;
      // Exclude already found recommendations and viewed items
      const excludeIds = [
        ...viewedIds,
        ...recommendations.map((p) => p._id),
      ];

      const fillers = await Product.find({
        status: "show",
        _id: { $nin: excludeIds },
      })
        .sort({ sales: -1 }) // Top selling generally
        .limit(limit);

      recommendations.push(...fillers);
    }

    res.status(200).json(recommendations);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// New controller to export products in CSV format for admin use
const exportProductsCSV = async (req, res) => {
  console.log("✅ CSV EXPORT API HIT");
  try {
    const products = await Product.find()
      .populate("categories", "name")
      .populate("brand", "name")
      .lean();

    if (!products || products.length === 0) {
      return res.status(200).json([]);
    }

    const formatted = products.map((item) => formatProductForCSV(item));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("CSV Export Error:", error);

    res.status(500).json({
      message: "Failed to export CSV",
    });
  }
};

// Import products from CSV data (JSON format after CSV parsing)
// Import products from CSV data (JSON format after CSV parsing)
const importProductsCSV = async (req, res) => {
  console.log("✅ CSV IMPORT API HIT");
  try {
    const productsData = req.body;

    if (!Array.isArray(productsData) || productsData.length === 0) {
      return res.status(400).json({
        message: "Please provide valid product data",
      });
    }

    // Fetch all categories and brands for lookup
    const allCategories = await Category.find({});
    const allBrands = await Brand.find({});

    // Create lookup maps for faster lookup
    // Create lookup maps for faster lookup
    const categoryMap = {};
    const categoryIdMap = {};
    allCategories.forEach((cat) => {
      if (cat.name) {
        if (typeof cat.name === "string") {
          categoryMap[cat.name] = cat._id;
          categoryIdMap[cat.name.toLowerCase()] = cat._id;
        } else if (typeof cat.name === "object") {
          Object.values(cat.name).forEach((val) => {
            if (typeof val === "string") {
              categoryMap[val] = cat._id;
              categoryIdMap[val.toLowerCase()] = cat._id;
            }
          });
        }
      }
    });

    const brandMap = {};
    const brandIdMap = {};
    allBrands.forEach((brand) => {
      if (brand.name) {
        if (typeof brand.name === "string") {
          brandMap[brand.name] = brand._id;
          brandIdMap[brand.name.toLowerCase()] = brand._id;
        } else if (typeof brand.name === "object") {
          Object.values(brand.name).forEach((val) => {
            if (typeof val === "string") {
              brandMap[val] = brand._id;
              brandIdMap[val.toLowerCase()] = brand._id;
            }
          });
        }
      }
    });

    // Sanitize and normalize payload with category/brand conversion
    const sanitizedDocs = await Promise.all(
      productsData.map(async (doc) => {
        const sanitized = {
          ...doc,
          ...normalizeTaxPayload(doc),
        };

        // Normalize Title
        if (typeof doc.title === "string") {
          sanitized.title = { en: doc.title };
        }

        // Normalize Description
        if (typeof doc.description === "string") {
          sanitized.description = { en: doc.description };
        }

        // Normalize Image (start)
        if (typeof doc.image === "string") {
          sanitized.image = [doc.image];
        }
        // Normalize Image (end)

        // Normalize Prices (if flat fields provided)
        if (!doc.prices && (doc.price || doc.originalPrice)) {
          sanitized.prices = {
            price: Number(doc.price) || 0,
            originalPrice: Number(doc.originalPrice) || 0,
            discount: Number(doc.discount) || 0,
          };
        }

        // Convert category string to ObjectId
        if (doc.category && typeof doc.category === "string") {
          const categoryId =
            categoryMap[doc.category] ||
            categoryIdMap[doc.category.toLowerCase()];
          if (categoryId) {
            sanitized.category = categoryId;
          }
        }

        // Convert categories array strings to ObjectIds
        if (Array.isArray(doc.categories) && doc.categories.length > 0) {
          sanitized.categories = doc.categories
            .map((cat) => {
              if (typeof cat === "string") {
                return (
                  categoryMap[cat] || categoryIdMap[cat.toLowerCase()]
                );
              }
              return cat;
            })
            .filter((id) => id);
        }

        // If categories is empty or not provided, use category as fallback
        if (!sanitized.categories || sanitized.categories.length === 0) {
          if (doc.category && typeof doc.category === "string") {
            const categoryId =
              categoryMap[doc.category] ||
              categoryIdMap[doc.category.toLowerCase()];
            if (categoryId) {
              sanitized.categories = [categoryId];
            }
          }
        }

        // Convert brand string to ObjectId
        if (doc.brand && typeof doc.brand === "string") {
          const brandId =
            brandMap[doc.brand] || brandIdMap[doc.brand.toLowerCase()];
          if (brandId) {
            sanitized.brand = brandId;
          }
        }

        return sanitized;
      })
    );

    // Insert products
    try {
      const result = await Product.insertMany(sanitizedDocs, { ordered: false });
      res.status(201).json({
        message: `${result.length} products imported successfully!`,
        count: result.length,
      });
    } catch (err) {
      // Handle Mongoose insertMany error (which might contain partial successes)
      if (err.name === 'ValidationError' || err.name === 'MongooseError') {
        // If ordered: false, some might have succeeded, but usually this throws if it fails.
        // We can check err.insertedDocs if available, but usually we just report failure here?
        // Actually with ordered:false, if some fail, it throws, but we might have partial success?
        console.error("Bulk Insert Validation Error:", err.message);
        return res.status(400).json({
          message: "Validation Error during imports. check your data (Categories must exist!). " + err.message,
        });
      }
      throw err;
    }

  } catch (error) {
    console.error("CSV Import Error:", error);

    res.status(400).json({
      message: error.message || "Failed to import products",
    });
  }
};

const updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || stock === null || Number.isNaN(Number(stock))) {
      return res.status(400).send({ message: "Valid stock quantity is required" });
    }

    const stockValue = Math.max(0, Number(stock));
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    if (product.isCombination && Array.isArray(product.variants) && product.variants.length > 0) {
      return res.status(400).send({
        message:
          "This product uses color/size variants. Update stock from the product edit page.",
      });
    }

    product.stock = stockValue;
    await product.save();

    res.send({
      message: "Stock updated successfully",
      product: {
        _id: product._id,
        stock: product.stock,
        title: product.title,
      },
    });
  } catch (err) {
    res.status(500).send({ message: err.message || "Failed to update stock" });
  }
};

module.exports = {
  addProductView,
  getRecommendations,
  addProduct,
  addAllProducts,
  getAllProducts,
  getShowingProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  updateProductStock,
  updateManyProducts,
  updateStatus,
  deleteProduct,
  deleteManyProducts,
  getShowingStoreProducts,
  exportProductsCSV,
  importProductsCSV,
};
