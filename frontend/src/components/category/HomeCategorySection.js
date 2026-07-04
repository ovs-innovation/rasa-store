import Link from "next/link";

const CategoryTile = ({ cat, index }) => {
  const num = String(index + 1).padStart(2, "0");
  const isFeatured = index === 1;
  const title = (cat.title || "").toUpperCase();

  return (
    <Link
      href={`/search?category=${cat.slug}`}
      className="group relative block overflow-hidden bg-[#0A0A0A] aspect-[4/5] sm:aspect-[16/10] md:aspect-auto md:min-h-[48vh] lg:min-h-[52vh]"
    >
      <img
        src={cat.image}
        alt={cat.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/5 transition-opacity duration-500 group-hover:from-black/45" />

      {isFeatured ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-10 text-center">
          <span className="mb-2 text-[10px] font-bold tracking-[0.35em] text-[#D4AF37]">{num}</span>
          <h3 className="text-3xl font-black uppercase tracking-tight text-[#D4AF37] sm:text-4xl lg:text-5xl xl:text-6xl">
            {title}
          </h3>
          <div className="mt-4 flex items-center gap-3 sm:mt-5">
            <span className="h-px w-6 bg-neutral-500 sm:w-10" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white sm:text-[10px]">
              Shop Now
            </span>
            <span className="h-px w-6 bg-neutral-500 sm:w-10" />
          </div>
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 p-6 text-left sm:p-8 lg:p-10">
          <span className="mb-2 block text-[10px] font-bold tracking-[0.35em] text-[#D4AF37]">{num}</span>
          <h3 className="text-3xl font-black uppercase leading-none tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
            {title}
          </h3>
        </div>
      )}
    </Link>
  );
};

const HomeCategorySection = ({ categories = [] }) => {
  if (!categories.length) return null;

  return (
    <section className="bg-[#050505] pb-0 pt-2 sm:pt-4">
      <div className="flex items-center gap-3 px-4 py-5 sm:gap-4 sm:px-8 sm:py-6">
        <div className="h-px flex-1 bg-neutral-800" />
        <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.35em] text-white sm:text-[10px]">
          Shop by Category
        </span>
        <div className="h-px flex-1 bg-neutral-800" />
      </div>

      <div className="grid grid-cols-1 gap-px bg-neutral-900/80 md:grid-cols-2">
        {categories.map((cat, idx) => (
          <CategoryTile key={cat.id} cat={cat} index={idx} />
        ))}
      </div>
    </section>
  );
};

export default HomeCategorySection;
