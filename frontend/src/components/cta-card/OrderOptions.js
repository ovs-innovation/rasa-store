import React from "react";
import { FiShield, FiTruck, FiRefreshCw } from "react-icons/fi";

const OrderOptions = () => {
  return (
    <div className="w-full max-w-6xl mx-auto mt-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Benefit 1 */}
        <div className="flex items-center p-6 bg-white border border-gray-100 shadow-sm rounded-none">
          <div className="mr-5 bg-black p-4 text-white">
            <FiShield className="text-xl" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-extrabold tracking-widest uppercase mb-1">Premium Quality</span>
            <span className="text-gray-900 font-black text-sm uppercase leading-tight">
              100% Verified Garments
            </span>
          </div>
        </div>

        {/* Benefit 2 */}
        <div className="flex items-center p-6 bg-white border border-gray-100 shadow-sm rounded-none">
          <div className="mr-5 bg-black p-4 text-white">
            <FiTruck className="text-xl" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-extrabold tracking-widest uppercase mb-1">Express Shipping</span>
            <span className="text-gray-900 font-black text-sm uppercase leading-tight">
              Free Delivery over $100
            </span>
          </div>
        </div>

        {/* Benefit 3 */}
        <div className="flex items-center p-6 bg-white border border-gray-100 shadow-sm rounded-none">
          <div className="mr-5 bg-black p-4 text-white">
            <FiRefreshCw className="text-xl" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-extrabold tracking-widest uppercase mb-1">Easy Returns</span>
            <span className="text-gray-900 font-black text-sm uppercase leading-tight">
              30-Day Exchange Guarantee
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderOptions;
