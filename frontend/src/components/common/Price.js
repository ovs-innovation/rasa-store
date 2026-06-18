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

  // Get discount percentage from prop or product
  // Show discount as percentage, not as amount (without decimals)
  let discountPercentage = 0;
  
  if (discount && discount > 0) {
    // If discount is percentage (<= 100), use it directly
    // If discount > 100, it might be amount, convert to percentage
    if (discount <= 100) {
      discountPercentage = Math.round(discount);
    } else if (originalPrice > 0) {
      // It's an amount, convert to percentage and round
      discountPercentage = Math.round((discount / originalPrice) * 100);
    }
  } else if (product?.prices?.discount) {
    // Fallback to product discount if discount prop is not available
    const productDiscount = Number(product.prices.discount);
    if (productDiscount > 0 && productDiscount <= 100) {
      discountPercentage = Math.round(productDiscount);
    } else if (productDiscount > 100 && originalPrice > 0) {
      // It's an amount, convert to percentage and round
      discountPercentage = Math.round((productDiscount / originalPrice) * 100);
    }
  }

  // Use passed `price` prop if provided, otherwise fallback to product prices
  const effectivePrice = Math.max(0, typeof price === 'number' && !Number.isNaN(price) ? price : Number(product?.prices?.price || 0));

  return (
    <div className="font-serif product-price font-bold">
      {product?.isCombination ? (
        <>
          <span
            className={
              card
                ? "inline-block text-lg font-semibold text-gray-800"
                : "inline-block text-2xl"
            }
          >
            {currency}
            {getNumberTwo(Math.max(0, price))}
          </span>
          {(!hideDiscountAndMRP && originalPrice > price) ? (
            <>
              <del
                className={
                  card
                    ? "sm:text-sm font-normal text-base text-gray-400 ml-1"
                    : "text-lg font-normal text-gray-400 ml-1"
                }
              >
                {currency}
                {getNumberTwo(originalPrice)}
              </del>
              <span
                className={
                  card
                    ? "block text-neutral-600 text-xs font-bold"
                    : "inline-block text-neutral-600 text-sm font-bold ml-2"
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
                : "inline-block text-2xl"
            }
          >
            {currency}
            {getNumberTwo(effectivePrice)}
          </span>
          {(!hideDiscountAndMRP && originalPrice > effectivePrice) ? (
            <>
              <del
                className={
                  card
                    ? "sm:text-sm font-normal text-base text-gray-400 ml-1"
                    : "text-lg font-normal text-gray-400 ml-1"
                }
              >
                {currency}
                {getNumberTwo(originalPrice)}
              </del>
              <span
                className={
                  card
                    ? "block text-neutral-600 text-xs font-bold"
                    : "inline-block text-neutral-600 text-sm font-bold ml-2"
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
