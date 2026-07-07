import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button, Input, Textarea, Select } from "@windmill/react-ui";
import { FiChevronLeft, FiSave } from "react-icons/fi";

import useProductSubmit from "@/hooks/useProductSubmit";
import Uploader from "@/components/image-uploader/Uploader";
import ParentCategory from "@/components/category/ParentCategory";
import Error from "@/components/form/others/Error";
import ProductPlacementFlags from "@/components/product/ProductPlacementFlags";
import ColorVariantManager from "@/components/product/ColorVariantManager";
import ProductPreviewCard from "@/components/product/ProductPreviewCard";
import Loading from "@/components/preloader/Loading";

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

const ProductFormPage = ({ productId }) => {
  const history = useHistory();
  const isEdit = Boolean(productId);

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
    handleSubmit,
    isSubmitting,
    productLoading,
    selectedCategory,
    setSelectedCategory,
    setDefaultCategory,
    brandOptions,
    brand,
    setBrand,
    watch,
    handleProductSlug,
    variants,
    setVariants,
  } = useProductSubmit(productId);

  const watchTitle = watch("title");
  const watchOriginalPrice = watch("originalPrice");
  const watchPrice = watch("price");
  const hasColorVariants = variants?.length > 0;
  const computedStock = hasColorVariants ? variantStockTotal(variants) : undefined;

  useEffect(() => {
    const list = Array.isArray(imageUrl)
      ? imageUrl.filter((item) => typeof item === "string" && item.trim())
      : [];
    setFeaturedImage(list[0] || "");
    setHoverImage(list[1] || list[0] || "");
  }, [imageUrl, setFeaturedImage, setHoverImage]);

  if (isEdit && productLoading) {
    return <Loading loading={productLoading} />;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-wider">
                {isEdit ? "Update Product" : "Add Product"}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isEdit
                  ? "Edit product details, pricing, stock, and homepage placement."
                  : "Create a new premium fashion storefront product."}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
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

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Short Description *</label>
                    <Textarea
                      {...register("description", { required: "Short description is required!" })}
                      rows="4"
                      placeholder={"Line 1\nLine 2\nLine 3\nLine 4"}
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 focus:border-emerald-500 font-mono text-sm"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Each line shows separately on the product page.</p>
                    <Error errorName={errors.description} />
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
                </div>
              </section>

              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-sm font-bold">2</span>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider">Product Images</h2>
                </div>
                <p className="text-xs text-gray-500">First image = main photo. Upload all photos together.</p>
                <Uploader
                  product={true}
                  folder="product"
                  imageUrl={imageUrl}
                  setImageUrl={setImageUrl}
                />
              </section>

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

              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-sm font-bold">4</span>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider">Section 4: Pricing</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">MRP (₹) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      onKeyDown={(e) => (e.key === "-" || e.key === "e") && e.preventDefault()}
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
                      onKeyDown={(e) => (e.key === "-" || e.key === "e") && e.preventDefault()}
                      {...register("price", { required: "Selling Price is required!" })}
                      placeholder="0"
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <Error errorName={errors.price} />
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-sm font-bold">5</span>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider">Color &amp; Size</h2>
                </div>
                <p className="text-xs text-gray-500 -mt-2">
                  Add color name, sizes, and stock per size. Or set a single stock quantity below if this product has no color variants.
                </p>

                {!hasColorVariants && (
                  <div className="max-w-xs">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Stock Quantity *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      onKeyDown={(e) => (e.key === "-" || e.key === "e") && e.preventDefault()}
                      {...register("stock", {
                        required: !hasColorVariants ? "Stock is required!" : false,
                        min: { value: 0, message: "Stock cannot be negative" },
                      })}
                      placeholder="0"
                      className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <Error errorName={errors.stock} />
                  </div>
                )}

                {hasColorVariants && (
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Total stock: {computedStock} units (sum of all size quantities)
                  </p>
                )}

                <ColorVariantManager variants={variants} setVariants={setVariants} watch={watch} />
              </section>

              {hasColorVariants && (
                <input type="hidden" {...register("stock")} value={computedStock} />
              )}
              <input type="hidden" {...register("status")} value="Published" />

              <section className="space-y-6">
                <ProductPlacementFlags tag={tag} setTag={setTag} />
              </section>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3.5 rounded-xl flex items-center shadow-lg shadow-emerald-200 dark:shadow-none font-bold transition-all gap-2"
                >
                  <FiSave className="text-lg" />
                  {isEdit ? "Save Changes" : "Save & Publish Product"}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-1 lg:sticky lg:top-8">
              <ProductPreviewCard
                title={watchTitle}
                brandName={brand ? brand.name?.en || brand.name : ""}
                originalPrice={watchOriginalPrice}
                discount={
                  Number(watchOriginalPrice || 0) -
                  (Number(watchPrice) || Number(watchOriginalPrice || 0))
                }
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

export default ProductFormPage;
