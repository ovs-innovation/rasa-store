import React from "react";

const FLAGS = [
  { id: "featured", label: "Featured Product" },
  { id: "trending", label: "Trending Product" },
  { id: "new-arrival", label: "New Arrival" },
  { id: "sale", label: "Sale Product" },
  { id: "best-seller", label: "Best Seller" },
  { id: "limited-edition", label: "Limited Edition" },
];

const ProductPlacementFlags = ({ tag = [], setTag }) => {
  const toggle = (flagId) => {
    setTag((prev) =>
      prev.includes(flagId) ? prev.filter((t) => t !== flagId) : [...prev, flagId]
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <h2 className="text-lg font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 mb-4">
        Homepage Placement
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Control where this product appears on the RASA storefront homepage.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FLAGS.map(({ id, label }) => {
          const active = tag.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left text-sm font-semibold transition-colors ${
                active
                  ? "bg-[#D4AF37]/15 border-[#D4AF37] text-gray-900 dark:text-white"
                  : "bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#D4AF37]/50"
              }`}
            >
              <span
                className={`w-4 h-4 rounded border flex-shrink-0 ${
                  active ? "bg-[#D4AF37] border-[#D4AF37]" : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductPlacementFlags;
