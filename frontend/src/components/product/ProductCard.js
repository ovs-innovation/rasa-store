import { useState } from "react";
import Image from "next/image";
import { IoAdd, IoBagAddSharp, IoRemove } from "react-icons/io5";
import { FiHeart } from "react-icons/fi";
import { useCart } from "react-use-cart";
import { useRouter } from "next/router";

import { notifyError, notifySuccess } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import useGetSetting from "@hooks/useGetSetting";
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
  const [wishlistActive, setWishlistActive] = useState(false);

  const { addItem, updateItemQuantity, inCart, getItem } = useCart();
  const { handleIncreaseQuantity } = useAddToCart();
  const { globalSetting } = useGetSetting();
  const { showingTranslateValue, getNumberTwo } = useUtilsFunction();
  const router = useRouter();

  const currency = globalSetting?.default_currency || "₹";

  const getBrandName = () => {
    if (product?.brandName) return product.brandName;
    const titleStr = showingTranslateValue(product?.title) || "";
    return titleStr.split(" ")[0] || "Rasa";
  };

  const activeItemId = product._id;
  const isItemInCart = inCart(activeItemId);

  const handleAddItem = (p) => {
    if (p.stock < 1) return notifyError("Insufficient stock!");
    if (product?.variants?.length > 0) {
      notifyError("Please select size on product page.");
      router.push(`/product/${product.slug}`);
      return;
    }

    const { slug, variants, categories, description, ...updatedProduct } = product;
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
    notifySuccess("Added to cart");
  };

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
    } catch {
      notifyError("Failed to add to wishlist");
    }
  };

  const basePrice = product?.isCombination
    ? product?.variants[0]?.price
    : product?.prices?.price;
  const currentPrice = Number(basePrice) || 0;
  const discount = product?.isCombination
    ? product?.variants[0]?.discount
    : product?.prices?.discount;
  let originalPriceValue = product?.isCombination
    ? product?.variants[0]?.originalPrice
    : product?.prices?.originalPrice;
  if (!originalPriceValue && discount) {
    originalPriceValue = currentPrice + (Number(discount) || 0);
  }
  originalPriceValue = Number(originalPriceValue) || 0;
  const displayPrice = currentPrice > 0 ? currentPrice : originalPriceValue;
  const hasSale = currentPrice > 0 && originalPriceValue > currentPrice;
  const discountPercent = hasSale
    ? Math.round(((originalPriceValue - currentPrice) / originalPriceValue) * 100)
    : 0;

  const isSoldOut = product.stock < 1;
  const title = showingTranslateValue(product?.title);
  const primaryImg = product.featuredImage || product.image?.[0];
  const hoverImg = product.hoverImage || product.image?.[1];

  const goToProduct = () => {
    router.push(`/product/${product.slug}`);
    handleLogEvent("product", `navigated to ${title} product page`);
  };

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

      <article className="product-card group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-neutral-800/60 bg-[#0A0A0A] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-[#D4AF37]/25 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] sm:rounded-2xl">
        {/* Full-bleed image — no side/top gap */}
        <button
          type="button"
          onClick={goToProduct}
          className="relative block w-full flex-shrink-0 cursor-pointer overflow-hidden bg-[#141414] aspect-[3/4] sm:aspect-[4/5]"
          aria-label={`View ${title}`}
        >
          {primaryImg ? (
            <>
              <img
                src={primaryImg}
                alt={title}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${
                  hoverImg
                    ? "opacity-100 group-hover:opacity-0 group-hover:scale-105"
                    : "group-hover:scale-105"
                }`}
                loading="lazy"
              />
              {hoverImg && (
                <img
                  src={hoverImg}
                  alt={title}
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <Image src="/placeholder.png" fill className="object-cover" alt="product" />
          )}

          {/* Subtle bottom fade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent sm:h-16" />

          {isSoldOut && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/55 backdrop-blur-[2px]">
              <span className="rounded-full bg-white/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                Sold Out
              </span>
            </div>
          )}

          {!hideDiscount && hasSale && discountPercent > 0 && discountPercent < 100 && (
            <span className="absolute left-0 top-2 z-20 bg-[#D4AF37] px-2 py-0.5 text-[7px] font-black uppercase tracking-widest text-black sm:top-3 sm:px-2.5 sm:py-1 sm:text-[8px]">
              -{discountPercent}%
            </span>
          )}

          {!hideWishlistCompare && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleAddToWishlist}
              onKeyDown={(e) => e.key === "Enter" && handleAddToWishlist(e)}
              id={`wishlist-${product._id}`}
              aria-label="Add to wishlist"
              className={`absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md transition-all sm:right-2.5 sm:top-2.5 sm:h-8 sm:w-8 ${
                wishlistActive
                  ? "bg-[#D4AF37] text-black"
                  : "bg-black/35 text-white hover:bg-black/55"
              }`}
            >
              <FiHeart
                className={`h-3.5 w-3.5 stroke-[2] ${
                  wishlistActive ? "fill-black stroke-black" : ""
                }`}
              />
            </span>
          )}
        </button>

        {/* Info */}
        <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-2 sm:px-4 sm:pb-4 sm:pt-3.5">
          <p className="mb-0.5 truncate text-[7px] font-bold uppercase tracking-[0.22em] text-[#D4AF37] sm:mb-1 sm:text-[8px]">
            {getBrandName()}
          </p>

          <h3
            onClick={goToProduct}
            onKeyDown={(e) => e.key === "Enter" && goToProduct()}
            role="link"
            tabIndex={0}
            title={title}
            className="mb-2 min-h-[1.75rem] cursor-pointer line-clamp-2 text-[10px] font-bold uppercase leading-snug tracking-wide text-white transition-colors hover:text-[#D4AF37] sm:mb-2.5 sm:min-h-[2.25rem] sm:text-xs"
          >
            {title}
          </h3>

          <div className="mt-auto space-y-2 sm:space-y-2.5">
            <div className="flex min-h-[1rem] items-baseline gap-1.5 sm:min-h-[1.25rem] sm:gap-2">
              <span className="text-sm font-black leading-none text-white sm:text-base">
                {currency}{getNumberTwo(Math.max(0, displayPrice))}
              </span>
              {hasSale && (
                <span className="text-[9px] font-medium leading-none text-neutral-500 line-through sm:text-[10px]">
                  {currency}{getNumberTwo(originalPriceValue)}
                </span>
              )}
            </div>

            {!hidePriceAndAdd && (
              <div className="h-8 sm:h-10">
                {isSoldOut ? (
                  <button
                    type="button"
                    disabled
                    className="flex h-full w-full items-center justify-center rounded-full bg-neutral-800/80 text-[8px] font-extrabold uppercase tracking-[0.2em] text-neutral-500"
                  >
                    Out of Stock
                  </button>
                ) : isItemInCart ? (
                  (() => {
                    const item = getItem(activeItemId);
                    return (
                      item && (
                        <div className="flex h-full w-full items-center justify-between rounded-full border border-neutral-800 bg-[#111] px-3 text-white">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateItemQuantity(item.id, item.quantity - 1);
                            }}
                            className="rounded-full p-1 hover:bg-white/10"
                          >
                            <IoRemove className="text-sm" />
                          </button>
                          <span className="font-mono text-xs font-black text-[#D4AF37]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIncreaseQuantity({ ...item, stock: product.stock });
                            }}
                            className="rounded-full p-1 hover:bg-white/10"
                          >
                            <IoAdd className="text-sm" />
                          </button>
                        </div>
                      )
                    );
                  })()
                ) : (
                  <div className="flex h-full gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToProduct();
                      }}
                      className="flex h-full flex-1 items-center justify-center rounded-full bg-[#D4AF37] text-[7px] font-extrabold uppercase tracking-[0.14em] text-black transition-all hover:bg-[#EAC348] active:scale-[0.98] sm:text-[9px]"
                    >
                      Shop Now
                    </button>
                    <button
                      type="button"
                      id={`add-to-cart-${product._id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddItem(product);
                      }}
                      title="Add to cart"
                      aria-label="Add to cart"
                      className="flex h-full w-8 shrink-0 items-center justify-center rounded-full border border-neutral-700/80 bg-[#111] text-neutral-300 transition-all hover:border-[#D4AF37]/50 hover:text-[#D4AF37] sm:w-10"
                    >
                      <IoBagAddSharp className="text-sm" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </>
  );
};

export default ProductCard;
