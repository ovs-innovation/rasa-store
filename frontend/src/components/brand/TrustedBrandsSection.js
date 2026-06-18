import React from "react";
import Image from "next/image";
import Link from "next/link";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useGetSetting from "@hooks/useGetSetting";

const TrustedBrandsSection = ({ brands = [] }) => {
  const { showingTranslateValue, showingImage } = useUtilsFunction();
  const { storeCustomizationSetting } = useGetSetting();

  // Filter brands that have logos
  const brandsWithLogos = brands.filter(brand => brand?.logo && brand.logo.trim() !== '');

  const fallbackBrands = [
    { _id: "fb_brand1", name: "ESSENTIALS" },
    { _id: "fb_brand2", name: "VETEMENTS" },
    { _id: "fb_brand3", name: "OFF-WHITE" },
    { _id: "fb_brand4", name: "BALENCIAGA" },
    { _id: "fb_brand5", name: "HELMUT LANG" },
    { _id: "fb_brand6", name: "VALENTINO" },
  ];

  const hasBrands = brandsWithLogos.length > 0;

  return (
    <div className="bg-[#050505] border-t border-b border-neutral-900 py-16 overflow-hidden">
      <div className="w-full">
        {/* Header Title */}
        <div className="text-center mb-12">
          <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest px-4 py-1.5 bg-[#0F0F0F] border border-neutral-800 rounded-full">
            Collaborators
          </span>
          <h2 className="text-xs font-black uppercase tracking-widest text-neutral-500 mt-6">
            {storeCustomizationSetting?.home?.brand_title || "CURATED BRANDS & COLLABORATORS"}
          </h2>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full flex items-center">
          {/* Fading side gradients */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

          <div className="flex marquee-track">
            {hasBrands ? (
              /* Database Brands list */
              <>
                {/* First loop */}
                {brandsWithLogos.map((brand) => {
                  const logoUrl = showingImage(brand.logo) || "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png";
                  return (
                    <Link
                      key={`brand-marquee-1-${brand._id}`}
                      href={`/search?brand=${brand._id}`}
                      className="flex-shrink-0 group mx-6"
                    >
                      <div className="bg-[#0F0F0F] rounded-none p-4 w-28 h-20 md:w-36 md:h-24 flex items-center justify-center border border-neutral-800 hover:border-[#D4AF37]/50 transition-all duration-300 relative overflow-hidden">
                        <div className="relative w-full h-full opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500">
                          <Image
                            src={logoUrl}
                            alt={showingTranslateValue(brand.name) || "Brand"}
                            fill
                            sizes="(max-width: 768px) 100px, 140px"
                            className="object-contain p-1 group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {/* Second loop */}
                {brandsWithLogos.map((brand) => {
                  const logoUrl = showingImage(brand.logo) || "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png";
                  return (
                    <Link
                      key={`brand-marquee-2-${brand._id}`}
                      href={`/search?brand=${brand._id}`}
                      className="flex-shrink-0 group mx-6"
                    >
                      <div className="bg-[#0F0F0F] rounded-none p-4 w-28 h-20 md:w-36 md:h-24 flex items-center justify-center border border-neutral-800 hover:border-[#D4AF37]/50 transition-all duration-300 relative overflow-hidden">
                        <div className="relative w-full h-full opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500">
                          <Image
                            src={logoUrl}
                            alt={showingTranslateValue(brand.name) || "Brand"}
                            fill
                            sizes="(max-width: 768px) 100px, 140px"
                            className="object-contain p-1 group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </>
            ) : (
              /* Typographical Fallback Marquee */
              <>
                {/* First Loop */}
                {fallbackBrands.map((brand) => (
                  <div
                    key={`fallback-1-${brand._id}`}
                    className="flex-shrink-0 mx-10 text-neutral-600 hover:text-white transition-colors duration-300 font-extrabold text-2xl md:text-4xl uppercase tracking-[0.25em] cursor-default font-serif"
                  >
                    {brand.name}
                  </div>
                ))}
                {/* Second Loop */}
                {fallbackBrands.map((brand) => (
                  <div
                    key={`fallback-2-${brand._id}`}
                    className="flex-shrink-0 mx-10 text-neutral-600 hover:text-white transition-colors duration-300 font-extrabold text-2xl md:text-4xl uppercase tracking-[0.25em] cursor-default font-serif"
                  >
                    {brand.name}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes marqueeLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track {
            display: inline-flex;
            align-items: center;
            width: max-content;
            will-change: transform;
            animation: marqueeLeft 18s linear infinite;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
        `
      }} />
    </div>
  );
};

export default TrustedBrandsSection;
