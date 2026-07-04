import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getBrandName, resolveBrandLogo } from "@utils/brandLogos";

const BrandMarquee = ({ displayBrands }) => {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const posRef = useRef(0);
  const rafRef = useRef(null);
  const SPEED = 0.45;
  const tripled = [...displayBrands, ...displayBrands, ...displayBrands];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const animate = () => {
      if (!paused) {
        posRef.current += SPEED;
        const totalW = track.scrollWidth;
        const singleW = totalW / 3;
        if (posRef.current >= singleW) {
          posRef.current = 0;
        }
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused]);

  return (
    <div
      className="relative overflow-hidden py-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-14 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-14 bg-gradient-to-l from-white to-transparent" />

      <div
        ref={trackRef}
        className="flex gap-8"
        style={{ willChange: "transform", width: "max-content" }}
      >
        {tripled.map((brand, i) => (
          <Link
            key={`${brand.id}-${i}`}
            href={`/search?brand=${encodeURIComponent(brand.slug)}`}
            className="group flex w-[112px] shrink-0 flex-col items-center"
          >
            <div className="flex h-[104px] w-[104px] items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-[#F9F9F9] transition-all duration-300 group-hover:scale-105 group-hover:border-[#D4AF37]">
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.displayName}
                  className="h-[100px] w-[100px] object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  draggable={false}
                />
              ) : (
                <span className="text-2xl font-black text-neutral-300">
                  {brand.displayName[0]}
                </span>
              )}
            </div>
            <p className="mt-3 w-full truncate text-center text-[9px] font-black uppercase tracking-widest text-neutral-600 transition-colors duration-300 group-hover:text-[#D4AF37]">
              {brand.displayName}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

const ShopByBrandSection = ({ brands = [], enabled = true }) => {
  if (enabled === false || !brands?.length) return null;

  const displayBrands = brands
    .map((brand) => ({
      id: brand._id || brand.slug,
      displayName: getBrandName(brand),
      slug: brand.slug,
      logo: resolveBrandLogo(brand),
    }))
    .filter((b) => b.slug);

  if (!displayBrands.length) return null;

  return (
    <section className="border-y border-neutral-200 bg-white py-10 font-sans md:py-16">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-8">
        <div className="mb-8 text-center md:mb-12">
          <h2 className="text-2xl font-black uppercase tracking-[0.12em] text-black sm:text-3xl">
            Shop By Brand
          </h2>
          <div className="mx-auto mt-3 h-[2px] w-12 bg-[#D4AF37]" />
        </div>

        {/* Desktop — big brand tiles */}
        <div className="hidden gap-4 md:grid md:grid-cols-4 lg:grid-cols-7">
          {displayBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/search?brand=${encodeURIComponent(brand.slug)}`}
              aria-label={`Shop ${brand.displayName}`}
              className="group block w-full overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-300 hover:border-[#D4AF37] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
            >
              <div className="relative w-full bg-white" style={{ paddingBottom: "95%" }}>
                <div className="absolute inset-0 flex items-center justify-center p-1">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.displayName}
                      className="h-[98%] w-[98%] object-contain transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <span className="text-4xl font-black text-neutral-200">
                      {brand.displayName[0]}
                    </span>
                  )}
                </div>
              </div>
              <div className="border-t border-neutral-100 bg-[#F9F9F9] px-3 py-3 transition-colors duration-300 group-hover:bg-[#D4AF37]">
                <p className="truncate text-center text-[9px] font-black uppercase tracking-widest text-neutral-600 transition-colors duration-300 group-hover:text-black">
                  {brand.displayName}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile — big scrolling logos */}
        <div className="block md:hidden">
          <BrandMarquee displayBrands={displayBrands} />
        </div>
      </div>
    </section>
  );
};

export default ShopByBrandSection;
