import React from "react";
import { Link, useHistory } from "react-router-dom";
import { Button, Input, Textarea, Select } from "@windmill/react-ui";
import { FiChevronLeft, FiSave } from "react-icons/fi";
import { useTranslation } from "react-i18next";

// Internal imports
import useProductSubmit from "@/hooks/useProductSubmit";
import Uploader from "@/components/image-uploader/Uploader";
import ParentCategory from "@/components/category/ParentCategory";
import Error from "@/components/form/others/Error";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import ProductPlacementFlags from "@/components/product/ProductPlacementFlags";
import ColorVariantManager from "@/components/product/ColorVariantManager";
import ProductPreviewCard from "@/components/product/ProductPreviewCard";

const AddProduct = () => {
  const { t } = useTranslation();
  const history = useHistory();

  const { showingTranslateValue } = useUtilsFunction();
  
  const variantStockTotal = (list = []) =>
    list.reduce(
      (total, variant) =>
        total +
        (variant.sizes || []).reduce(
          (sizeTotal, size) => sizeTotal + Number(size.quantity || 0),
          0
        ),
      0
    );
  
  const {
    tag,
    setTag,
    register,
    onSubmit,
    errors,
    imageUrl,
    setImageUrl,
    featuredImage,
    setFeaturedImage,
    hoverImage,
    setHoverImage,
    badge,
    setBadge,
    video,
    setVideo,
    handleSubmit,
    isSubmitting,
    selectedCategory,
    setSelectedCategory,
    setDefaultCategory,
    brandOptions,
    brand,
    setBrand,
    watch,
    slug,
    handleProductSlug,
    variants,
    setVariants,
    seoImage,
    setSeoImage,
  } = useProductSubmit();

  const watchTitle = watch("title");
  const watchOriginalPrice = watch("originalPrice");
  const watchPrice = watch("price");
  const watchSalePrice = watch("salePrice");

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => history.goBack()}
              className="p-2.5 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
            >
              <FiChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-wider">Add Product</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Create a new premium fashion storefront product.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Form Fields */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* SECTION 1 — BASIC INFORMATION */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-sm font-bold">1</span>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider">Section 1: Basic Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Product Name *</label>
                    <Input
                      {...register("title", { required: "Product Name is required!" })}
                      placeholder="e.g. Nike Air Max 90"
                      onBlur={(e) => handleProductSlug(e.target.value)}
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 focus:border-emerald-500"
                    />
                    <Error errorName={errors.title} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Slug (Auto Generated) *</label>
                    <Input
                      {...register("slug", { required: "Slug is required!" })}
                      defaultValue={slug}
                      placeholder="nike-air-max-90"
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 focus:border-emerald-500"
                    />
                    <Error errorName={errors.slug} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Product Type *</label>
                    <Select
                      {...register("productType", { required: "Product Type is required!" })}
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                    >
                      <option value="">Choose Type</option>
                      <option value="Sneakers">Sneakers</option>
                      <option value="Bags">Bags</option>
                      <option value="Slides">Slides</option>
                      <option value="Heels">Heels</option>
                      <option value="Accessories">Accessories</option>
                    </Select>
                    <Error errorName={errors.productType} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Gender *</label>
                    <Select
                      {...register("gender", { required: "Gender is required!" })}
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                    >
                      <option value="">Choose Gender</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Unisex">Unisex</option>
                    </Select>
                    <Error errorName={errors.gender} />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Short Description *</label>
                    <Textarea
                      {...register("description", { required: "Short description is required!" })}
                      rows="2"
                      placeholder="Provide a quick summary of the product (fit, style, materials)."
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 focus:border-emerald-500"
                    />
                    <Error errorName={errors.description} />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Full Description</label>
                    <Textarea
                      {...register("highlights")}
                      rows="4"
                      placeholder="Detailed breakdown of construction, heritage, aesthetic detail, and tech details."
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </section>

              {/* SECTION 2 — MEDIA */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-sm font-bold">2</span>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider">Section 2: Media</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Featured Image (Front View)</label>
                    <Uploader
                      product={false}
                      folder="product"
                      imageUrl={featuredImage ? [featuredImage] : []}
                      setImageUrl={(url) => setFeaturedImage(Array.isArray(url) ? url[0] : (url || ""))}
                      useOriginalSize={true}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Hover Image (Alternative View)</label>
                    <Uploader
                      product={false}
                      folder="product"
                      imageUrl={hoverImage ? [hoverImage] : []}
                      setImageUrl={(url) => setHoverImage(Array.isArray(url) ? url[0] : (url || ""))}
                      useOriginalSize={true}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Gallery Images</label>
                    <Uploader
                      product={true}
                      folder="product"
                      imageUrl={imageUrl}
                      setImageUrl={setImageUrl}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Product Video URL</label>
                    <Input
                      value={video}
                      onChange={(e) => setVideo(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>
                </div>
              </section>

              {/* SECTION 3 — PRODUCT ORGANIZATION */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-sm font-bold">3</span>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider">Section 3: Product Organization</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Brand *</label>
                    <Select
                      value={brand?._id || ""}
                      onChange={(e) => {
                        const selected = brandOptions?.find((item) => item._id === e.target.value);
                        setBrand(selected || null);
                      }}
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                    >
                      <option value="">Select brand</option>
                      {brandOptions?.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name?.en || item.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Category *</label>
                    <ParentCategory
                      lang="en"
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      setDefaultCategory={setDefaultCategory}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Product Badge</label>
                    <Select
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                    >
                      <option value="">No Badge</option>
                      <option value="New">New</option>
                      <option value="Trending">Trending</option>
                      <option value="Best Seller">Best Seller</option>
                      <option value="Limited Edition">Limited Edition</option>
                    </Select>
                  </div>
                </div>
              </section>

              {/* SECTION 4 — PRICING */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-sm font-bold">4</span>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider">Section 4: Pricing</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">MRP (₹) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      onKeyDown={(e) => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                      {...register("originalPrice", { required: "MRP is required!" })}
                      placeholder="0"
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <Error errorName={errors.originalPrice} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Selling Price (₹) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      onKeyDown={(e) => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                      {...register("price", { required: "Selling Price is required!" })}
                      placeholder="0"
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <Error errorName={errors.price} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Sale Price (Optional)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      onKeyDown={(e) => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                      {...register("salePrice")}
                      placeholder="0"
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>
                </div>
              </section>

              {/* SECTION 5 — INVENTORY & STATUS */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-sm font-bold">5</span>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider">Section 5: Inventory</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Base SKU</label>
                    <Input
                      {...register("sku")}
                      placeholder="e.g. NIKE-AM90-BLK"
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Total Stock *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      {...register("stock", {
                        required: variants?.length ? false : "Stock is required!",
                        min: { value: 0, message: "Stock cannot be negative" },
                      })}
                      placeholder="e.g. 50"
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <Error errorName={errors.stock} />
                    <p className="text-[11px] text-gray-400 mt-1">
                      {variants?.length > 0
                        ? `Variant stock total: ${variantStockTotal(variants)} units (edit in Section 6)`
                        : "Units available to sell on the storefront"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Low Stock Alert *</label>
                    <Input
                      type="number"
                      min="0"
                      {...register("lowStockAlert")}
                      placeholder="e.g. 5"
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Status</label>
                    <Select
                      {...register("status")}
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                    >
                      <option value="Published">Published (Live on store)</option>
                      <option value="Draft">Draft</option>
                      <option value="Hidden">Hidden</option>
                      <option value="Out Of Stock">Out Of Stock</option>
                    </Select>
                  </div>
                </div>
              </section>

              {/* SECTION 6 — VARIANTS */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-sm font-bold">6</span>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider">Section 6: Variants</h2>
                </div>
                <p className="text-xs text-gray-500 -mt-2">Configure color variants with color thumbnails and custom Galleries, and UK size stocks nested under each color.</p>
                
                <ColorVariantManager
                  variants={variants}
                  setVariants={setVariants}
                  watch={watch}
                />
              </section>

              {/* SECTION 7 — SEO */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-sm font-bold">7</span>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider">Section 7: SEO</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Meta Title</label>
                    <Input
                      {...register("metaTitle")}
                      placeholder="Search engine optimized listing title"
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Meta Description</label>
                    <Textarea
                      {...register("metaDescription")}
                      rows="3"
                      placeholder="Meta description for search snippets"
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">SEO Image</label>
                    <Uploader
                      product={false}
                      folder="seo"
                      imageUrl={seoImage ? [seoImage] : []}
                      setImageUrl={(url) => setSeoImage(Array.isArray(url) ? url[0] : (url || ""))}
                      useOriginalSize={true}
                    />
                  </div>
                </div>
              </section>

              {/* HOMEPAGE PLACEMENT */}
              <section className="space-y-6">
                <ProductPlacementFlags tag={tag} setTag={setTag} />
              </section>

              {/* Submit Action */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3.5 rounded-xl flex items-center shadow-lg shadow-emerald-200 dark:shadow-none font-bold transition-all gap-2"
                >
                  <FiSave className="text-lg" />
                  Save & Publish Product
                </Button>
              </div>

            </div>

            {/* Right Column: Live Sticky Card Preview */}
            <div className="lg:col-span-1 lg:sticky lg:top-8">
              <ProductPreviewCard
                title={watchTitle}
                brandName={brand ? (brand.name?.en || brand.name) : ""}
                originalPrice={watchOriginalPrice}
                discount={Number(watchOriginalPrice || 0) - (Number(watchSalePrice) || Number(watchPrice) || Number(watchOriginalPrice || 0))}
                discountType="flat"
                badge={badge}
                featuredImage={featuredImage}
                hoverImage={hoverImage}
              />
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
