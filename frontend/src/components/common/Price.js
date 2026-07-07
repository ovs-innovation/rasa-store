import useUtilsFunction from "@hooks/useUtilsFunction";

const Price = ({
  product,
  price,
  card,
  currency,
  originalPrice,
  discount,
  showTaxLabel,
  hideDiscountAndMRP = false,
}) => {
  // console.log("price", price, "originalPrice", originalPrice, "card", card);
  const { getNumberTwo } = useUtilsFunction();
  const taxRateValue = Number(product?.taxRate ?? 0);
  const shouldShowTax =
    typeof showTaxLabel === "boolean" ? showTaxLabel : !card;
  const hasTaxInfo =
    shouldShowTax && !Number.isNaN(taxRateValue) && taxRateValue >= 0;
  const taxBadgeText = hasTaxInfo
    ? `${product?.isPriceInclusive ? "Incl. GST" : "Excl. GST"} (${taxRateValue}%)`
    : "";

  // Get original price with fallback to product levels
  let effectiveOriginalPrice = Number(originalPrice || 0);
  if (!effectiveOriginalPrice && product?.prices?.originalPrice) {
    effectiveOriginalPrice = Number(product.prices.originalPrice);
  }

  // Use passed `price` prop if provided, otherwise fallback to product prices
  let effectivePrice = typeof price === 'number' && !Number.isNaN(price) ? price : Number(product?.prices?.price || 0);
  effectivePrice = Math.max(0, effectivePrice);

  // Safeguard: if selling price is 0 but MRP (original price) is > 0, fallback to original price and clear discount
  let finalDiscount = discount;
  if (effectivePrice === 0 && effectiveOriginalPrice > 0) {
    effectivePrice = effectiveOriginalPrice;
    finalDiscount = 0;
  }

  // Get discount percentage from prop or product
  // Show discount as percentage, not as amount (without decimals)
  let discountPercentage = 0;
  
  if (finalDiscount && finalDiscount > 0) {
    // If discount is percentage (<= 100), use it directly
    // If discount > 100, it might be amount, convert to percentage
    if (finalDiscount <= 100) {
      discountPercentage = Math.round(finalDiscount);
    } else if (effectiveOriginalPrice > 0) {
      // It's an amount, convert to percentage and round
      discountPercentage = Math.round((finalDiscount / effectiveOriginalPrice) * 100);
    }
  } else if (product?.prices?.discount && finalDiscount !== 0) {
    // Fallback to product discount if discount prop is not available
    const productDiscount = Number(product.prices.discount);
    if (productDiscount > 0 && productDiscount <= 100) {
      discountPercentage = Math.round(productDiscount);
    } else if (productDiscount > 100 && effectiveOriginalPrice > 0) {
      // It's an amount, convert to percentage and round
      discountPercentage = Math.round((productDiscount / effectiveOriginalPrice) * 100);
    }
  }

  return (
    <div className="font-serif product-price font-bold">
      {product?.isCombination ? (
        <>
          <span
            className={
              card
                ? "inline-block text-lg font-semibold text-gray-800"
                : "inline-block text-3xl font-black text-white tracking-tight"
            }
          >
            {currency}
            {getNumberTwo(Math.max(0, effectivePrice))}
          </span>
          {(!hideDiscountAndMRP && effectiveOriginalPrice > effectivePrice) ? (
            <>
              <del
                className={
                  card
                    ? "sm:text-sm font-normal text-base text-gray-400 ml-1"
                    : "text-base font-normal text-neutral-500 ml-2"
                }
              >
                {currency}
                {getNumberTwo(effectiveOriginalPrice)}
              </del>
              <span
                className={
                  card
                    ? "block text-neutral-600 text-xs font-bold"
                    : "inline-block text-[#D4AF37] text-sm font-bold ml-2"
                }
              >
                {Math.round(discountPercentage)}% Off
              </span>
            </>
          ) : null}
        </>
      ) : (
        <>
          <span
            className={
              card
                ? "inline-block text-lg font-semibold text-gray-800"
                : "inline-block text-3xl font-black text-white tracking-tight"
            }
          >
            {currency}
            {getNumberTwo(effectivePrice)}
          </span>
          {(!hideDiscountAndMRP && effectiveOriginalPrice > effectivePrice) ? (
            <>
              <del
                className={
                  card
                    ? "sm:text-sm font-normal text-base text-gray-400 ml-1"
                    : "text-base font-normal text-neutral-500 ml-2"
                }
              >
                {currency}
                {getNumberTwo(effectiveOriginalPrice)}
              </del>
              <span
                className={
                  card
                    ? "block text-neutral-600 text-xs font-bold"
                    : "inline-block text-[#D4AF37] text-sm font-bold ml-2"
                }
              >
                {Math.round(discountPercentage)}% Off
              </span>
            </>
          ) : null}
        </>
      )}
      {hasTaxInfo && (
        <p className="text-[11px] sm:text-xs font-medium mt-1">
          {product?.isPriceInclusive ? (
            <span className="inline-block text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 rounded-none font-bold uppercase tracking-wider text-[10px] border border-[#D4AF37]/20">
              (Incl. of GST)
            </span>
          ) : (
            <span className="text-neutral-400">
              + GST Extra 
              <span className="ml-1 inline-flex items-center rounded-none bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-300">
                {taxRateValue}%
              </span>
            </span>
          )}
        </p>
      )}
    </div>
  );
};

export default Price;
