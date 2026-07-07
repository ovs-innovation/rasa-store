const Brand = require("../models/Brand");

const slugify = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

const buildSlug = async (baseText, currentId = null) => {
  let baseSlug = slugify(baseText);
  if (!baseSlug) {
    baseSlug = `brand-${Date.now()}`;
  }

  let uniqueSlug = baseSlug;
  let suffix = 1;

  // Keep looping until slug is unique (ignoring the current document when updating)
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await Brand.findOne({
      slug: uniqueSlug,
      ...(currentId ? { _id: { $ne: currentId } } : {}),
    });

    if (!existing) break;

    uniqueSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return uniqueSlug;
};

const addBrand = async (req, res) => {
  try {
    const {
      name,
      description = {},
      slug,
      logo = "",
      coverImage = "",
      websiteUrl = "",
      sortOrder = 0,
      isFeatured = false,
      showOnHomepage = true,
      status = "show",
    } = req.body;

    if (!name) {
      return res.status(400).send({ message: "Brand name is required." });
    }

    const computedSlug = await buildSlug(
      slug || name.en || Object.values(name)[0] || ""
    );

    const brand = new Brand({
      name,
      description,
      slug: computedSlug,
      logo,
      coverImage,
      websiteUrl,
      sortOrder: Number.isNaN(Number(sortOrder))
        ? 0
        : Number(sortOrder),
      isFeatured,
      showOnHomepage: showOnHomepage !== false,
      status,
    });

    await brand.save();

    res.status(201).send({
      message: "Brand added successfully!",
      brand,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find({}).sort({ createdAt: -1 });
    res.send(brands);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getShowingBrands = async (req, res) => {
  try {
    const forHomepage = req.query.homepage === "true" || req.query.homepage === "1";
    const query = { status: "show" };
    if (forHomepage) {
      query.showOnHomepage = { $ne: false };
    }

    const brands = await Brand.find(query).sort({
      isFeatured: -1,
      sortOrder: 1,
      createdAt: -1,
    });
    res.send(brands);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).send({ message: "Brand not found!" });
    }
    res.send(brand);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const updateBrand = async (req, res) => {
  try {
    const {
      name,
      description,
      slug,
      logo,
      coverImage,
      websiteUrl,
      sortOrder,
      isFeatured,
      status,
      showOnHomepage,
    } = req.body;

    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).send({ message: "Brand not found!" });
    }

    const updatedSlug = await buildSlug(
      slug || name?.en || Object.values(name || {})[0] || brand.slug,
      brand._id
    );

    brand.name = name || brand.name;
    brand.description = description || brand.description;
    brand.slug = updatedSlug;
    brand.logo = logo !== undefined ? logo : brand.logo;
    brand.coverImage = coverImage !== undefined ? coverImage : brand.coverImage;
    brand.websiteUrl = websiteUrl !== undefined ? websiteUrl : brand.websiteUrl;
    if (sortOrder !== undefined && !Number.isNaN(Number(sortOrder))) {
      brand.sortOrder = Number(sortOrder);
    }
    brand.isFeatured =
      typeof isFeatured === "boolean" ? isFeatured : brand.isFeatured;
    brand.showOnHomepage =
      typeof showOnHomepage === "boolean" ? showOnHomepage : brand.showOnHomepage;
    brand.status = status || brand.status;

    await brand.save();

    res.send({ message: "Brand updated successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const updateBrandStatus = async (req, res) => {
  try {
    const { status } = req.body;

    await Brand.updateOne(
      { _id: req.params.id },
      {
        $set: {
          status,
        },
      }
    );

    res.send({
      message: `Brand ${status === "show" ? "Published" : "Un-Published"} Successfully!`,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const deleteBrand = async (req, res) => {
  try {
    await Brand.deleteOne({ _id: req.params.id });
    res.send({ message: "Brand deleted successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const deleteManyBrands = async (req, res) => {
  try {
    const { ids = [] } = req.body;
    if (!ids.length) {
      return res.status(400).send({ message: "No brand ids provided!" });
    }

    await Brand.deleteMany({ _id: { $in: ids } });
    res.send({ message: "Brands deleted successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports = {
  addBrand,
  getAllBrands,
  getShowingBrands,
  getBrandById,
  updateBrand,
  updateBrandStatus,
  deleteBrand,
  deleteManyBrands,
};

