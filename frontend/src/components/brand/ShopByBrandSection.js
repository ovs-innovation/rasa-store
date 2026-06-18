import Link from "next/link";
import { getBrandName, resolveBrandLogo } from "@utils/brandLogos";

const ShopByBrandSection = ({ brands = [], enabled = true }) => {
  if (enabled === false || !brands?.length) return null;

  const displayBrands = brands
    .map((brand) => ({
      id: brand._id || brand.slug,
      displayName: getBrandName(brand),
      slug: brand.slug,
      logo: resolveBrandLogo(brand),
    }))
    .filter((b) => b.logo && b.slug);

  if (!displayBrands.length) return null;

  const marqueeItems = [...displayBrands, ...displayBrands];

  const LogoLink = ({ brand, suffix, className = "" }) => (
    <Link
      key={`${brand.id}-${suffix}`}
      href={`/search?brand=${encodeURIComponent(brand.slug)}`}
      className={`group flex shrink-0 items-center justify-center ${className}`}
      aria-label={`Shop ${brand.displayName}`}
    >
      <img
        src={brand.logo}
        alt={brand.displayName}
        className="h-8 sm:h-9 md:h-11 w-auto max-w-[140px] object-contain transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        draggable={false}
      />
    </Link>
  );

  return (
    <section className="relative py-16 md:py-24 bg-white border-b border-neutral-100 overflow-hidden">
      <div className="relative mx-auto max-w-screen-2xl px-4 sm:px-8 z-10 font-sans">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#D4AF37]">
            Authorized labels
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-[0.2em] text-black leading-none">
            Shop By Brand
          </h2>
          <p className="mt-4 text-neutral-400 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em]">
            Tap a logo to explore the collection
          </p>
        </div>

        {/* Desktop: logo ribbon with dividers */}
        <div className="hidden lg:block">
          <div className="mx-auto max-w-5xl rounded-2xl border border-neutral-200/80 bg-[#FAFAFA] px-10 py-12 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between gap-6">
              {displayBrands.map((brand, index) => (
                <div key={brand.id} className="flex flex-1 items-center justify-center min-w-0">
                  {index > 0 && (
                    <span
                      className="mr-6 h-10 w-px shrink-0 bg-neutral-200"
                      aria-hidden="true"
                    />
                  )}
                  <LogoLink brand={brand} suffix="static" className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile / tablet: infinite marquee */}
        <div className="lg:hidden relative rounded-xl border border-neutral-200/80 bg-[#FAFAFA] py-8 overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10" />
          <div className="flex shop-brand-marquee">
            {marqueeItems.map((brand, idx) => (
              <LogoLink
                key={`${brand.id}-m-${idx}`}
                brand={brand}
                suffix={idx}
                className="mx-10"
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shopBrandMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .shop-brand-marquee {
          display: inline-flex;
          align-items: center;
          width: max-content;
          animation: shopBrandMarquee 28s linear infinite;
        }
        .shop-brand-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default ShopByBrandSection;
