import { useState } from "react";
import Image from "next/image";
import { IoAdd, IoBagAddSharp, IoRemove, IoEyeOutline } from "react-icons/io5";
import { FiHeart } from "react-icons/fi";
import { useCart } from "react-use-cart";
import { useRouter } from "next/router";

//internal import
import Price from "@components/common/Price";
import Stock from "@components/common/Stock";
import { notifyError, notifySuccess } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import useGetSetting from "@hooks/useGetSetting";
import Discount from "@components/common/Discount";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ProductModal from "@components/modal/ProductModal";
import { handleLogEvent } from "src/lib/analytics";
import { addToWishlist } from "@lib/wishlist";

const ProductCard = ({
  product,
  attributes,
  hidePriceAndAdd = false,
  hideDiscount = false,
  hideWishlistCompare = false,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSizeId, setSelectedSizeId] = useState(null);
  const [wishlistActive, setWishlistActive] = useState(false);

  const { items, addItem, updateItemQuantity, inCart, getItem } = useCart();
  const { handleIncreaseQuantity } = useAddToCart();
  const { globalSetting } = useGetSetting();
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue, getNumberTwo } = useUtilsFunction();
  const router = useRouter();

  const currency = globalSetting?.default_currency || "₹";

  // ── Brand Name ──────────────────────────────────────────────────────────────
  const getBrandName = () => {
    if (product?.brandName) return product.brandName;
    const titleStr = showingTranslateValue(product?.title) || "";
    const knownBrands = [
      "Nike",
      "Adidas",
      "New Balance",
      "Puma",
      "Converse",
      "Jordan",
      "Yeezy",
    ];
    const matched = knownBrands.find((b) =>
      titleStr.toLowerCase().includes(b.toLowerCase())
    );
    if (matched) return matched;
    return titleStr.split(" ")[0] || "Rasa";
  };

  // ── Size Variants ────────────────────────────────────────────────────────────
  const sizeAttribute = attributes?.find(
    (att) =>
      att?.name?.en?.toLowerCase() === "size" ||
      att?.title?.en?.toLowerCase() === "size"
  );
  const sizeAttrId = sizeAttribute?._id;
  const sizeOptionIds =
    product.variants && sizeAttrId
      ? Array.from(
          new Set(
            product.variants.map((v) => v[sizeAttrId]).filter(Boolean)
          )
        )
      : [];

  const availableSizes = sizeOptionIds
    .map((id) => {
      const opt = sizeAttribute.variants?.find((v) => v._id === id);
      return {
        id,
        name: opt ? showingTranslateValue(opt.name) : id,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  // ── Cart State ───────────────────────────────────────────────────────────────
  const getActiveCartItemId = () => {
    if (product?.variants?.length > 0) {
      return selectedSizeId ? `${product._id}-${selectedSizeId}` : null;
    }
    return product._id;
  };
  const activeItemId = getActiveCartItemId();
  const isItemInCart = activeItemId ? inCart(activeItemId) : false;

  // ── Add to Cart ──────────────────────────────────────────────────────────────
  const handleAddItem = (p) => {
    if (p.stock < 1) return notifyError("Insufficient stock!");
    if (product?.variants?.length > 0) {
      if (!selectedSizeId) {
        notifyError("Please select a size first!");
        return;
      }
      const selectedVariant = product.variants.find(
        (v) => v[sizeAttrId] === selectedSizeId
      );
      if (!selectedVariant) return notifyError("Variant not available!");
      if (Number(selectedVariant.quantity || 0) < 1)
        return notifyError("Selected size is out of stock!");

      const { slug, variants, categories, description, ...updatedProduct } =
        product;
      const priceToUse =
        selectedVariant.price || product.prices?.price || 0;
      const originalPriceToUse =
        selectedVariant.originalPrice || product.prices?.originalPrice || priceToUse;

      const sizeVariantDetail = sizeAttribute.variants?.find(
        (v) => v._id === selectedSizeId
      );
      const sizeName = sizeVariantDetail
        ? showingTranslateValue(sizeVariantDetail.name)
        : selectedSizeId;

      addItem(
        {
          ...updatedProduct,
          id: `${product._id}-${selectedSizeId}`,
          title: `${showingTranslateValue(product.title)} - ${sizeName}`,
          variant: selectedVariant,
          price: priceToUse,
          originalPrice: originalPriceToUse,
          image: selectedVariant.image || product.image?.[0] || product.images?.[0],
        },
        1
      );
      notifySuccess(`Added size ${sizeName} to cart!`);
      return;
    }

    const { slug, variants, categories, description, ...updatedProduct } =
      product;
    const priceToUse = p.prices?.price || 0;

    addItem(
      {
        ...updatedProduct,
        title: showingTranslateValue(p?.title),
        id: p._id,
        variant: p.prices,
        price: priceToUse,
        originalPrice: product.prices?.originalPrice,
        image: product.image?.[0] || product.images?.[0],
      },
      1
    );
    notifySuccess("Product added to cart!");
  };

  // ── Wishlist ─────────────────────────────────────────────────────────────────
  const handleAddToWishlist = (e) => {
    e.stopPropagation();
    if (typeof window === "undefined") return;
    try {
      const result = addToWishlist(product);
      if (!result.ok && result.reason === "exists") {
        notifyError("Already in wishlist");
        return;
      }
      if (!result.ok) {
        notifyError("Failed to add to wishlist");
        return;
      }
      setWishlistActive(true);
      notifySuccess("Added to wishlist");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      notifyError("Failed to add to wishlist");
    }
  };

  // ── Pricing ──────────────────────────────────────────────────────────────────
  const basePrice = product?.isCombination
    ? product?.variants[0]?.price
    : product?.prices?.price;
  const currentPrice = basePrice;
  const discount = product?.isCombination
    ? product?.variants[0]?.discount
    : product?.prices?.discount;
  let originalPriceValue = product?.isCombination
    ? product?.variants[0]?.originalPrice
    : product?.prices?.originalPrice;
  if (!originalPriceValue && discount) {
    originalPriceValue = (basePrice || 0) + (discount || 0);
  }
  const hasSale = originalPriceValue > currentPrice;
  const discountPercent =
    hasSale
      ? Math.round(((originalPriceValue - currentPrice) / originalPriceValue) * 100)
      : 0;

  const isSoldOut = product.stock < 1;
  const title = showingTranslateValue(product?.title);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {modalOpen && (
        <ProductModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          product={product}
          currency={currency}
          attributes={attributes}
        />
      )}

      <div className="group relative w-full flex flex-col bg-[#0D0D0D] border border-neutral-800 hover:border-[#D4AF37]/40 transition-all duration-300 rounded-xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.7)]">

        {/* ── Image Area ─────────────────────────────────────────────────────── */}
        <div
          onClick={() => {
            router.push(`/product/${product.slug}`);
            handleLogEvent("product", `navigated to ${title} product page`);
          }}
          className="relative w-full aspect-[4/5] bg-[#141414] overflow-hidden cursor-pointer flex-shrink-0"
        >
          {/* Sold Out Overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center backdrop-blur-[1px]">
              <span className="bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-sm">
                Sold Out
              </span>
            </div>
          )}

          {/* Discount % Badge */}
          {!hideDiscount && hasSale && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 bg-black text-[#D4AF37] text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
              -{discountPercent}%
            </div>
          )}

          {/* Wishlist Button */}
          {!hideWishlistCompare && (
            <button
              onClick={handleAddToWishlist}
              id={`wishlist-${product._id}`}
              aria-label="Add to wishlist"
              className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-20 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-md border backdrop-blur-sm transition-all duration-200 ${
                wishlistActive
                  ? "bg-[#D4AF37] border-[#D4AF37] text-black"
                  : "bg-black/50 border-neutral-700 text-neutral-300 hover:border-[#D4AF37] hover:text-[#D4AF37]"
              }`}
            >
              <FiHeart
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2] transition-all ${
                  wishlistActive ? "fill-[#D4AF37] stroke-[#D4AF37]" : ""
                }`}
              />
            </button>
          )}



          {/* Product Images */}
          <div className="w-full h-full relative">
            {(() => {
              const primaryImg = product.featuredImage || product.image?.[0];
              const hoverImg   = product.hoverImage   || product.image?.[1];
              return primaryImg ? (
                <>
                  <img
                    src={primaryImg}
                    alt={title}
                    className={`w-full h-full object-cover transition-all duration-500 ease-out ${
                      hoverImg
                        ? "opacity-100 group-hover:opacity-0 group-hover:scale-105"
                        : "group-hover:scale-105"
                    }`}
                  />
                  {hoverImg && (
                    <img
                      src={hoverImg}
                      alt={title}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out opacity-0 scale-105 group-hover:opacity-100"
                    />
                  )}
                </>
              ) : (
                <Image
                  src="/placeholder.png"
                  fill
                  className="object-cover"
                  alt="product"
                />
              );
            })()}
          </div>
        </div>

        {/* ── Info + Actions ──────────────────────────────────────────────────── */}
        <div className="p-2.5 sm:p-4 flex flex-col gap-2 sm:gap-3 bg-[#0D0D0D] flex-grow">

          {/* Brand + Title */}
          <div>
            <span className="text-[8px] sm:text-[9px] font-black text-[#D4AF37]/70 uppercase tracking-[0.2em] block mb-0.5">
              {getBrandName()}
            </span>
            <h4
              onClick={() => router.push(`/product/${product.slug}`)}
              title={title}
              className="text-xs sm:text-sm font-black text-white uppercase tracking-tight leading-tight hover:text-[#D4AF37] transition-colors cursor-pointer line-clamp-2 min-h-[2rem] sm:min-h-[2.25rem]"
            >
              {title}
            </h4>
          </div>

          {/* Price Row */}
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-lg font-black text-white leading-none">
              {currency}{getNumberTwo(Math.max(0, currentPrice))}
            </span>
            {hasSale && (
              <span className="text-[10px] sm:text-xs text-neutral-500 line-through leading-none font-medium">
                {currency}{getNumberTwo(originalPriceValue)}
              </span>
            )}
          </div>

          {/* Size Pills — single tidy scroll row */}
          {availableSizes.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-0.5 px-0.5">
              {availableSizes.map((sz) => {
                const isSelected = selectedSizeId === sz.id;
                return (
                  <button
                    key={sz.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSizeId(isSelected ? null : sz.id);
                    }}
                    className={`shrink-0 text-[9px] font-extrabold uppercase min-w-[2rem] px-2 py-1 border rounded-md transition-all duration-150 ${
                      isSelected
                        ? "bg-[#D4AF37] border-[#D4AF37] text-black shadow-sm"
                        : "bg-transparent border-neutral-700 text-neutral-300 hover:border-[#D4AF37] hover:text-white"
                    }`}
                  >
                    {sz.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Add to Cart / Qty Controls */}
          {!hidePriceAndAdd && (
            <div className="mt-auto">
              {isSoldOut ? (
                <button
                  disabled
                  className="w-full h-9 sm:h-11 font-extrabold text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] bg-neutral-800 text-neutral-500 cursor-not-allowed flex items-center justify-center rounded-lg sm:rounded-xl shadow-sm"
                >
                  Out of Stock
                </button>
              ) : isItemInCart ? (
                (() => {
                  const item = getItem(activeItemId);
                  return (
                    item && (
                      <div className="h-9 sm:h-11 w-full flex items-center justify-between bg-[#161616] border border-neutral-800 text-white px-2.5 sm:px-4 font-bold text-[10px] sm:text-xs rounded-lg sm:rounded-xl shadow-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateItemQuantity(item.id, item.quantity - 1);
                          }}
                          className="p-1 sm:p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <IoRemove className="text-sm sm:text-base" />
                        </button>
                        <span className="font-mono text-xs sm:text-sm font-black tracking-wider text-[#D4AF37]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            item?.variants?.length > 0
                              ? handleAddItem(item)
                              : handleIncreaseQuantity({
                                  ...item,
                                  stock: product.stock,
                                });
                          }}
                          className="p-1 sm:p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <IoAdd className="text-sm sm:text-base" />
                        </button>
                      </div>
                    )
                  );
                })()
              ) : (
                <div className="flex gap-1.5 sm:gap-2 w-full">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/product/${product.slug}`);
                    }}
                    className="flex-1 h-9 sm:h-11 font-extrabold text-[8px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em] bg-[#D4AF37] hover:bg-[#e3c456] text-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center rounded-lg sm:rounded-xl shadow-sm"
                  >
                    Shop Now
                  </button>
                  <button
                    id={`add-to-cart-${product._id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddItem(product);
                    }}
                    title="Add to Cart"
                    className="w-9 h-9 sm:w-11 sm:h-11 bg-white/5 border border-neutral-800 text-white hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all flex items-center justify-center rounded-lg sm:rounded-xl shrink-0"
                  >
                    <IoBagAddSharp className="text-sm sm:text-base" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Bottom accent line — appears on hover ────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </>
  );
};

export default ProductCard;
