import Link from "next/link";

const CategoryTile = ({ cat }) => {
  const title = (cat.title || "").trim();

  return (
    <Link
      href={`/search?category=${cat.slug}`}
      className="group relative block aspect-[16/9] sm:aspect-[2/1] overflow-hidden rounded-2xl bg-neutral-900"
    >
      <img
        src={cat.image}
        alt={cat.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

      <div className="absolute inset-0 flex flex-col items-start justify-end p-6 sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37] mb-2">
          Explore
        </p>
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
          {title}
        </h3>
        <span className="mt-3 text-xs font-medium text-white/70 group-hover:text-[#D4AF37] transition-colors">
          Shop now →
        </span>
      </div>
    </Link>
  );
};

const HomeCategorySection = ({ categories = [], enabled = true }) => {
  if (!enabled || !categories.length) return null;

  return (
    <section className="bg-[#050505] py-8 md:py-10">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-neutral-800" />
          <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.35em] text-neutral-500">
            Shop by Category
          </span>
          <div className="h-px flex-1 bg-neutral-800" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          {categories.map((cat) => (
            <CategoryTile key={cat.id} cat={cat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeCategorySection;
