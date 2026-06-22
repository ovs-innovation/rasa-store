import React, { useState } from "react";
import { FiMonitor, FiSmartphone } from "react-icons/fi";

const ProductPreviewCard = ({
  title,
  brandName,
  originalPrice,
  discount,
  discountType,
  badge,
  featuredImage,
  hoverImage,
}) => {
  const [isPreviewMobile, setIsPreviewMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const finalPrice = (() => {
    const orig = Number(originalPrice) || 0;
    const disc = Number(discount) || 0;
    let final = orig;
    if (discountType === "percentage") {
      final = orig - (orig * disc / 100);
    } else {
      final = orig - disc;
    }
    return Math.max(0, final).toFixed(2);
  })();

  const imageToDisplay = isHovered && hoverImage ? hoverImage : (featuredImage || "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png");

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
        <div>
          <h3 className="text-base font-bold text-gray-800 dark:text-white uppercase tracking-wider">Live Card Preview</h3>
          <p className="text-xs text-gray-500">See how this product appears to storefront shoppers.</p>
        </div>
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-950 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setIsPreviewMobile(false)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !isPreviewMobile
                ? "bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
            }`}
          >
            <FiMonitor size={14} />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPreviewMobile(true)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isPreviewMobile
                ? "bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
            }`}
          >
            <FiSmartphone size={14} />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex justify-center bg-gray-50 dark:bg-gray-900/50 p-8 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 min-h-[420px] items-center transition-all">
        <div
          className={`bg-white dark:bg-gray-950 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 border border-gray-100 dark:border-gray-800 ${
            isPreviewMobile ? "w-[300px] rounded-[40px] ring-8 ring-gray-800 dark:ring-gray-900" : "w-full max-w-[340px]"
          }`}
        >
          {/* Mobile Status Bar Simulation */}
          {isPreviewMobile && (
            <div className="h-6 bg-gray-850 text-[10px] text-gray-500 px-6 flex justify-between items-center border-b border-gray-900 select-none">
              <span>9:41</span>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-gray-500 rounded-full"></span>
                <span className="w-4 h-2 bg-gray-500 rounded-sm"></span>
              </div>
            </div>
          )}

          {/* Product Card Container */}
          <div
            className="group relative flex flex-col w-full bg-white dark:bg-gray-900 transition-all select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Image Wrap */}
            <div className="aspect-[4/5] w-full overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
              {badge && (
                <span className="absolute top-3 left-3 bg-black text-white dark:bg-white dark:text-black px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md z-10 shadow-md">
                  {badge}
                </span>
              )}
              <img
                src={imageToDisplay}
                alt={title || "Product Image"}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Content */}
            <div className="p-4 space-y-1.5 flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {brandName || "RASA Streetwear"}
              </span>
              <h4 className="text-sm font-black text-gray-800 dark:text-white truncate">
                {title || "Urban Sports Samba OG"}
              </h4>
              <div className="flex items-center space-x-2 pt-1">
                <span className="text-sm font-black text-gray-950 dark:text-white">
                  ₹{Number(finalPrice).toLocaleString("en-IN")}
                </span>
                {Number(discount) > 0 && (
                  <span className="text-xs text-gray-400 line-through">
                    ₹{Number(originalPrice).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Home indicator simulation */}
          {isPreviewMobile && (
            <div className="h-6 flex items-center justify-center bg-white dark:bg-gray-900">
              <div className="w-24 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewCard;
