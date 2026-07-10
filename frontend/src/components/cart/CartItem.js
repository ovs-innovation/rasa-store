import { useContext } from "react";
import Link from "next/link";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import Image from "next/image";

//internal import
import useAddToCart from "@hooks/useAddToCart";
import useCartDB from "@hooks/useCartDB";
import { SidebarContext } from "@context/SidebarContext";
import { notifyError } from "@utils/toast";
import { PRODUCT_PLACEHOLDER } from "@utils/brandAssets";

const CartItem = ({ item, currency = "₹", variant = "default" }) => {
  const { closeCartDrawer } = useContext(SidebarContext);
  const { handleIncreaseQuantity } = useAddToCart();
  const { updateQuantityWithDB, removeItemWithDB } = useCartDB();
  const isCheckout = variant === "checkout";

  const originalPrice =
    item.originalPrice ||
    item.mrp ||
    item.prices?.original ||
    item.price * 1.2;
  const currentPrice = item.price || item.prices?.sale || 0;
  const discount = originalPrice > currentPrice ? originalPrice - currentPrice : 0;
  const discountPercentage =
    originalPrice > currentPrice
      ? ((discount / originalPrice) * 100).toFixed(0)
      : 0;

  const imageSrc =
    (Array.isArray(item.image) ? item.image[0] : item.image) ||
    (Array.isArray(item.images) ? item.images[0] : item.images) ||
    PRODUCT_PLACEHOLDER;

  const handleDecrease = async () => {
    if (item.quantity <= 1) {
      notifyError("Minimum quantity is 1");
      return;
    }
    await updateQuantityWithDB(item.id, item.quantity - 1);
  };

  const handleRemove = async () => {
    await removeItemWithDB(item.id);
  };

  const quantityControls = (
    <div className="flex items-center gap-2 shrink-0">
      <div
        className={`h-9 flex items-center justify-center p-1 rounded-lg transition-all duration-200 ${
          isCheckout
            ? "border border-neutral-700 bg-[#050505]"
            : "border-2 border-emerald-300 bg-white shadow-sm"
        }`}
      >
        <button
          type="button"
          onClick={handleDecrease}
          className={`h-full px-2.5 rounded-md transition-colors duration-150 active:scale-95 ${
            isCheckout ? "hover:bg-neutral-800" : "hover:bg-gray-100"
          }`}
        >
          <FiMinus className={isCheckout ? "text-neutral-300" : "text-gray-600"} />
        </button>

        <span
          className={`text-sm font-bold px-2 min-w-[1.75rem] text-center ${
            isCheckout ? "text-white" : "text-gray-800"
          }`}
        >
          {item.quantity}
        </span>

        <button
          type="button"
          onClick={() => handleIncreaseQuantity(item)}
          className={`h-full px-2.5 rounded-md transition-colors duration-150 active:scale-95 ${
            isCheckout ? "hover:bg-neutral-800" : "hover:bg-emerald-50"
          }`}
        >
          <FiPlus className={isCheckout ? "text-[#D4AF37]" : "text-emerald-600"} />
        </button>
      </div>

      <button
        type="button"
        onClick={handleRemove}
        className={`h-9 w-9 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 active:scale-95 ${
          isCheckout
            ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
            : "hover:bg-red-50 text-red-400 hover:text-red-600"
        }`}
        aria-label="Remove item"
      >
        <FiTrash2 className="text-lg" />
      </button>
    </div>
  );

  if (isCheckout) {
    return (
      <div className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] p-3 sm:p-4">
        <div className="flex gap-3">
          <div className="relative shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-lg overflow-hidden border border-neutral-700 bg-[#050505]">
            <Image
              key={item.id}
              src={imageSrc}
              width={72}
              height={72}
              alt={item.title}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="flex-1 min-w-0">
            <Link
              href={`/product/${item.slug || item.id || item._id}`}
              className="text-sm sm:text-base font-semibold text-white hover:text-[#D4AF37] transition-colors line-clamp-2 leading-snug"
            >
              {item.title}
            </Link>

            {originalPrice > currentPrice && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className="text-[11px] sm:text-xs text-neutral-400 line-through">
                  MRP: {currency}{originalPrice.toFixed(2)}
                </span>
                <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
                  {discountPercentage}% OFF
                </span>
              </div>
            )}

            <p className="text-[11px] sm:text-xs text-neutral-400 mt-1.5">
              Unit:{" "}
              <span className="text-[#D4AF37] font-semibold">
                {currency}{item.price.toFixed(2)}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-neutral-800">
          <div className="min-w-0">
            <span className="text-[11px] text-neutral-400 uppercase tracking-wide">Total</span>
            <p className="font-bold text-base sm:text-lg text-[#D4AF37] leading-tight truncate">
              {currency}{(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
          {quantityControls}
        </div>
      </div>
    );
  }

  return (
    <div className="group w-full h-auto flex justify-start items-start bg-white py-4 px-4 mb-3 rounded-xl border border-gray-200 hover:border-emerald-300 shadow-md hover:shadow-xl transition-all duration-300 relative">
      <div className="relative flex rounded-xl border-2 border-gray-100 shadow-sm hover:shadow-md overflow-hidden flex-shrink-0 cursor-pointer mr-4 transition-all duration-300 group-hover:border-emerald-200 bg-gray-50">
        <Image
          key={item.id}
          src={imageSrc}
          width={70}
          height={70}
          alt={item.title}
          className="object-cover"
        />
      </div>

      <div className="flex flex-col w-full overflow-hidden flex-1 min-w-0">
        <Link
          href={`/product/${item.slug || item.id || item._id}`}
          onClick={closeCartDrawer}
          className="truncate text-sm md:text-base font-semibold text-gray-800 hover:text-emerald-600 transition-colors duration-200 line-clamp-2 mb-1.5"
        >
          {item.title}
        </Link>

        {originalPrice > currentPrice && (
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 line-through font-medium">
              MRP: {currency}{originalPrice.toFixed(2)}
            </span>
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
              {discountPercentage}% OFF
            </span>
          </div>
        )}

        <span className="text-xs text-gray-500 mb-2 font-medium">
          Unit Price:{" "}
          <span className="text-emerald-600 font-semibold">
            {currency}{item.price.toFixed(2)}
          </span>
        </span>

        <div className="flex flex-wrap items-center justify-between gap-2 mt-auto pt-2">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">Total</span>
            <span className="font-bold text-base md:text-lg text-gray-900 leading-tight">
              {currency}{(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
          {quantityControls}
        </div>
      </div>
    </div>
  );
};

export default CartItem;
