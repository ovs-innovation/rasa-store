import { useRouter } from "next/router";
import useUtilsFunction from "@hooks/useUtilsFunction";

const GRID_CLASSES = [
  "md:col-span-2 md:row-span-1 h-[280px] sm:h-[320px] md:h-[400px]",
  "md:col-span-1 md:row-span-2 h-[280px] sm:h-[320px] md:h-full min-h-[300px]",
  "md:col-span-1 md:row-span-1 h-[280px] sm:h-[320px]",
  "md:col-span-1 md:row-span-1 h-[280px] sm:h-[320px]",
];

const getCategoryImage = (cat) => {
  if (!cat) return "";
  if (Array.isArray(cat.images) && cat.images[0]) return cat.images[0];
  if (typeof cat.image === "string") return cat.image;
  if (cat.icon) return cat.icon;
  return "";
};

const FeatureCategory = ({ categories = [] }) => {
  const router = useRouter();
  const { showingTranslateValue } = useUtilsFunction();

  const collections = (categories || [])
    .filter((cat) => cat?.slug)
    .slice(0, 4)
    .map((cat, idx) => ({
      id: cat._id || cat.id || cat.slug,
      title: showingTranslateValue(cat.name) || cat.title || cat.slug,
      subtitle: cat.description || "Explore the collection",
      img: getCategoryImage(cat) || "/rasaLogo.png",
      slug: cat.slug,
      gridClass: GRID_CLASSES[idx % GRID_CLASSES.length],
    }));

  if (!collections.length) {
    return (
      <p className="text-gray-500 text-center py-8">
        No categories available yet.
      </p>
    );
  }

  const handleCategoryClick = (slug) => {
    router.push(`/search?category=${slug}`);
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collections.map((col) => (
          <div
            key={col.id}
            onClick={() => handleCategoryClick(col.slug)}
            className={`relative group overflow-hidden cursor-pointer shadow-sm hover:shadow-xl border border-gray-150 transition-all duration-500 rounded-none ${col.gridClass}`}
          >
            <div className="absolute inset-0 w-full h-full">
              <img
                src={col.img}
                alt={col.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500 group-hover:via-black/50"></div>
            </div>

            <div className="absolute inset-0 z-10 p-6 sm:p-8 flex flex-col justify-end">
              <span className="text-[10px] text-[#D4AF37] font-extrabold uppercase tracking-widest mb-1.5">
                Collection
              </span>
              <h3 className="text-white font-black text-xl sm:text-2xl lg:text-3xl uppercase tracking-tight leading-none mb-2">
                {col.title}
              </h3>
              <p className="text-gray-400 text-[10px] sm:text-xs max-w-md font-medium mb-4 leading-snug">
                {col.subtitle}
              </p>
              <div>
                <span className="inline-flex items-center gap-2 px-5 py-3 bg-white text-black font-extrabold text-[10px] uppercase tracking-wider group-hover:bg-[#D4AF37] transition-all">
                  View Drops
                  <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureCategory;
