import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getBrandName } from "@utils/brandLogos";

const BrandMarquee = ({ displayBrands }) => {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const posRef = useRef(0);
  const rafRef = useRef(null);
  const SPEED = 0.4;
  const doubled = [...displayBrands, ...displayBrands, ...displayBrands];

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
      {/* Smooth gradients for edges (white to transparent) */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div 
        ref={trackRef} 
        className="flex gap-6" 
        style={{ willChange: "transform", width: "max-content" }}
      >
        {doubled.map((brand, i) => (
          <Link
            key={`${brand.id}-${i}`}
            href={`/search?brand=${encodeURIComponent(brand.slug)}`}
            className="group flex flex-col items-center shrink-0 w-[100px]"
          >
            {/* Circle Image wrapper */}
            <div className="w-[96px] h-[96px] rounded-full bg-[#F9F9F9] border border-neutral-100 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:border-[#D4AF37]">
              {brand.image ? (
                <img
                  src={brand.image}
                  alt={brand.displayName}
                  className="w-[85%] h-[85%] object-contain object-center scale-[1.35] transition-transform duration-400"
                  loading="lazy"
                  draggable={false}
                />
              ) : (
                <span className="text-xl font-black text-neutral-300">
                  {brand.displayName[0]}
                </span>
              )}
            </div>

            {/* Brand name */}
            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-600 group-hover:text-[#D4AF37] text-center mt-2.5 transition-colors duration-300 truncate w-full">
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
      image: brand.image || brand.logo || null,
    }))
    .filter((b) => b.slug);

  if (!displayBrands.length) return null;

  return (
    <section className="py-8 md:py-16 bg-white border-y border-neutral-200 font-sans">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-8">

        {/* Header */}
        <div className="mb-6 md:mb-10 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mb-2">
            Authorized Labels
          </p>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.12em] text-black">
            Shop By Brand
          </h2>
          <div className="h-[2px] w-12 bg-[#D4AF37] mx-auto mt-3" />
        </div>

        {/* Desktop View: Grid (7 columns) */}
        <div className="hidden md:grid md:grid-cols-7 gap-3">
          {displayBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/search?brand=${encodeURIComponent(brand.slug)}`}
              aria-label={`Shop ${brand.displayName}`}
              className="group block bg-white rounded-xl border border-neutral-200 hover:border-[#D4AF37] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 overflow-hidden w-full"
            >
              {/* Image area */}
              <div className="relative w-full bg-white" style={{ paddingBottom: "90%" }}>
                <div className="absolute inset-0 p-3 flex items-center justify-center">
                  {brand.image ? (
                    <img
                      src={brand.image}
                      alt={brand.displayName}
                      className="w-full h-full object-contain object-center transition-transform duration-400 group-hover:scale-108"
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl font-black text-neutral-200">
                        {brand.displayName[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Brand name bar */}
              <div className="px-3 py-2.5 border-t border-neutral-100 bg-[#F9F9F9] group-hover:bg-[#D4AF37] transition-colors duration-300">
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-600 group-hover:text-black text-center transition-colors duration-300 truncate">
                  {brand.displayName}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile View: Auto-scrolling marquee */}
        <div className="block md:hidden">
          <BrandMarquee displayBrands={displayBrands} />
        </div>

      </div>
    </section>
  );
};

export default ShopByBrandSection;
