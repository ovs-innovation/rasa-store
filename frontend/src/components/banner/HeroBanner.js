import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IoChevronForward } from "react-icons/io5";

const DEFAULT_HERO_SLIDES = [
  {
    id: "01",
    brand: "Rasa",
    name: "Fresh Drops",
    desc: "Affordable sneakers and streetwear — curated picks, delivered to your door.",
    image: "/shoes1.png",
    bgText: "RASA",
    glowColor: "rgba(212, 175, 55, 0.2)",
    accentColor: "#D4AF37",
    textGradient: "linear-gradient(180deg, #F8E9A6 0%, #E7C765 28%, #D4AF37 55%, #9A7B22 80%, #6E5512 100%)",
    shopLink: "/search?category=footwear",
  },
  {
    id: "02",
    brand: "Rasa",
    name: "Bags & More",
    desc: "Bags, accessories and latest styles — if you've seen it, chances are we've got it.",
    image: "/bag1.png",
    bgText: "BAGS",
    glowColor: "rgba(176, 122, 79, 0.2)",
    accentColor: "#B07A4F",
    textGradient: "linear-gradient(180deg, #E2C2A4 0%, #CFA57E 30%, #B07A4F 60%, #7E512E 100%)",
    shopLink: "/search?category=bags",
    isBag: true,
  },
];

const CMS_FALLBACK_SLIDES = [
  {
    title: "Fresh Drops",
    subtitle: "Fresh Drops",
    description: DEFAULT_HERO_SLIDES[0].desc,
    image: "/shoes1.png",
    link: "/search?category=footwear",
    brand: "Rasa",
  },
  {
    title: "Bags & More",
    subtitle: "Bags & More",
    description: DEFAULT_HERO_SLIDES[1].desc,
    image: "/bag1.png",
    link: "/search?category=bags",
    brand: "Rasa",
    accentColor: "#B07A4F",
  },
];

const isBagSlide = (slide = {}) =>
  /bag|duffle|backpack/i.test(
    `${slide.title || ""} ${slide.subtitle || ""} ${slide.link || ""} ${slide.image || ""}`
  );

const isFootwearSlide = (slide = {}) =>
  /footwear|shoe|sneaker/i.test(
    `${slide.title || ""} ${slide.subtitle || ""} ${slide.link || ""} ${slide.image || ""}`
  );

/** Always ensure shoes + bags hero slides when CMS has fewer than 2 */
const normalizeHeroSlides = (cmsSlides = []) => {
  const input = Array.isArray(cmsSlides) ? cmsSlides.filter(Boolean) : [];
  if (input.length >= 2) return input;

  if (!input.length) return CMS_FALLBACK_SLIDES;

  const merged = [...input];
  if (!merged.some(isBagSlide)) {
    merged.push(CMS_FALLBACK_SLIDES.find(isBagSlide));
  }
  if (!merged.some(isFootwearSlide) && merged.length < 2) {
    merged.unshift(CMS_FALLBACK_SLIDES.find((s) => !isBagSlide(s)));
  }
  return merged.slice(0, 2);
};

const mapCmsToHeroSlide = (s, i) => ({
  id: String(i + 1).padStart(2, "0"),
  brand: s.brand || s.title?.split(" ")[0] || "RASA",
  name: s.subtitle || s.title || "",
  desc:
    s.description ||
    s.desc ||
    (isBagSlide(s)
      ? "Bags, accessories and latest styles — if you've seen it, chances are we've got it."
      : "Affordable sneakers and streetwear — curated picks, delivered to your door."),
  image: s.image || "/shoes1.png",
  bgText: (s.brand || s.title || "RASA").toUpperCase().slice(0, 4),
  glowColor: isBagSlide(s) ? "rgba(176, 122, 79, 0.2)" : "rgba(212, 175, 55, 0.2)",
  accentColor: s.accentColor || (isBagSlide(s) ? "#B07A4F" : "#D4AF37"),
  textGradient: isBagSlide(s)
    ? "linear-gradient(180deg, #E2C2A4 0%, #CFA57E 30%, #B07A4F 60%, #7E512E 100%)"
    : "linear-gradient(180deg, #F8E9A6 0%, #D4AF37 100%)",
  shopLink: s.link || "/search",
  isBag: isBagSlide(s),
});

const HeroBanner = ({ cmsSlides = [] }) => {
  const slides = normalizeHeroSlides(cmsSlides).map(mapCmsToHeroSlide);
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const spacerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Mobile slider state
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);

  useEffect(() => {
    let ctx;

    // Visible gap (px) between the navbar and where the hero content begins.
    const NAV_GAP = 20;

    const applyHeaderOffset = () => {
      const header = document.getElementById("site-header");
      const h = header ? header.offsetHeight : 0;
      if (containerRef.current) containerRef.current.style.marginTop = `-${h}px`;
      if (spacerRef.current) spacerRef.current.style.height = `${h + NAV_GAP}px`;
    };
    applyHeaderOffset();

    // Mouse move parallax handler (Desktop only)
    const handleMouseMove = (e) => {
      if (window.innerWidth < 768) return;
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 30;
      const yPos = (clientY / window.innerHeight - 0.5) * 30;
      mouseRef.current = { x: xPos, y: yPos };

      const activeShoe = document.querySelector(".shoe-img-active");
      if (activeShoe) {
        activeShoe.style.transform = `translate3d(${xPos}px, ${yPos}px, 0) rotate3d(${yPos / 10}, ${-xPos / 10}, 0, 15deg) rotate(-12deg)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Dynamic GSAP Import (Desktop only)
    const initGsap = async () => {
      if (window.innerWidth < 768) return; // Disable GSAP on mobile completely!

      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/dist/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2,
          },
        });

        // Initialize default layout styles
        slides.forEach((slide, i) => {
          if (i > 0) {
            gsap.set(`#details-${slide.id}`, { opacity: 0, y: 80, filter: "blur(10px)" });
            gsap.set(`#img-wrapper-${slide.id}`, { opacity: 0, scale: 0.6, rotation: -60, filter: "blur(10px)" });
            gsap.set(`#bg-text-${slide.id}`, { opacity: 0, scale: 0.8 });
          } else {
            const el = document.getElementById(`img-wrapper-${slide.id}`);
            if (el) el.classList.add("shoe-img-active");
          }
        });

        const HOLD = 1.4;
        tl.to({}, { duration: HOLD });

        slides.forEach((slide, i) => {
          if (i < slides.length - 1) {
            const next = slides[i + 1];

            tl.to(`#details-${slide.id}`, { opacity: 0, y: -80, filter: "blur(10px)", duration: 1.5 })
              .to(
                `#img-wrapper-${slide.id}`,
                {
                  opacity: 0,
                  scale: 1.4,
                  rotation: 60,
                  filter: "blur(15px)",
                  duration: 1.5,
                  onStart: () => {
                    const el = document.getElementById(`img-wrapper-${slide.id}`);
                    if (el) el.classList.remove("shoe-img-active");
                  },
                },
                "<"
              )
              .to(`#bg-text-${slide.id}`, { opacity: 0, scale: 1.2, duration: 1.5 }, "<")
              .to(
                stickyRef.current,
                { style: `--glow-color: ${next.glowColor}`, duration: 1 },
                "-=1"
              )
              .to(
                `#img-wrapper-${next.id}`,
                {
                  opacity: 1,
                  scale: 1,
                  rotation: 0,
                  filter: "blur(0px)",
                  duration: 1.5,
                  onComplete: () => {
                    const el = document.getElementById(`img-wrapper-${next.id}`);
                    if (el) el.classList.add("shoe-img-active");
                  },
                },
                "-=0.5"
              )
              .to(`#bg-text-${next.id}`, { opacity: 0.26, scale: 1, duration: 1.5 }, "<")
              .to(`#details-${next.id}`, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.5 }, "<")
              .to({}, { duration: HOLD });
          }
        });
      }, containerRef.current);
    };

    initGsap();

    const onResize = () => applyHeaderOffset();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", onResize);
      if (ctx) ctx.revert();
    };
  }, [slides.length]);

  // Mobile slideshow autoplay
  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveMobileIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────────────
          1. DESKTOP HERO SECTION (md:block, 100% UNCHANGED)
          ───────────────────────────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        id="hero-section"
        className="hidden md:block relative w-full bg-[#050505] select-none font-sans"
        style={{ height: `${slides.length * 135}vh` }}
      >
        {/* Sticky viewport frame */}
        <div
          ref={stickyRef}
          style={{ "--glow-color": slides[0].glowColor }}
          className="sticky top-0 w-full h-screen flex flex-col overflow-hidden transition-all duration-700"
        >
          {/* Spacer band */}
          <div ref={spacerRef} className="w-full shrink-0" aria-hidden="true" />

          {/* Hero stage */}
          <div className="relative flex-1 w-full flex items-center overflow-hidden">
            {/* Dynamic Light Beams */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
              <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#D4AF37]/5 to-transparent" />
              <div className="absolute top-1/2 left-[62%] -translate-x-1/2 -translate-y-1/2 w-[55vw] h-[55vw] rounded-full blur-[150px] bg-[var(--glow-color)] transition-all duration-700" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,transparent_0%,transparent_45%,#050505_95%)]" />
            </div>

            {/* Giant Background Word */}
            {slides.map((slide, index) => (
              <div
                key={`bg-text-${slide.id}`}
                id={`bg-text-${slide.id}`}
                className={`absolute inset-0 flex items-center justify-center pointer-events-none z-[1] select-none transition-opacity duration-500 ${
                  index === 0 ? "opacity-25" : "opacity-0"
                }`}
              >
                <h2
                  className="text-[26vw] md:text-[23vw] font-black uppercase tracking-[-0.04em] text-center leading-none whitespace-nowrap select-none font-sans"
                  style={{
                    backgroundImage: slide.textGradient,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                    WebkitTextStroke: "1px rgba(212, 175, 55, 0.08)",
                    filter: `drop-shadow(0 10px 40px ${slide.accentColor}33)`,
                  }}
                >
                  {slide.bgText}
                </h2>
              </div>
            ))}

            {/* Light streaks */}
            <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden">
              <div className="absolute top-[58%] left-[55%] -translate-x-1/2 w-[150vw] h-px bg-gradient-to-r from-transparent via-[var(--glow-color)] to-transparent rotate-[-16deg] opacity-80 transition-all duration-700" />
              <div className="absolute top-[68%] left-[55%] -translate-x-1/2 w-[150vw] h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent rotate-[-12deg] blur-[1px]" />
              <div className="absolute top-[44%] left-[60%] -translate-x-1/2 w-[120vw] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-[-20deg]" />
              <div className="absolute top-[80%] left-[50%] -translate-x-1/2 w-[120vw] h-px bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent rotate-[-8deg]" />
            </div>

            {/* Particles */}
            <div className="absolute inset-0 pointer-events-none z-[3] opacity-20 hidden lg:block">
              <div className="absolute w-1.5 h-1.5 bg-[#D4AF37] rounded-full blur-[1px] top-1/4 left-2/3 animate-[pulse_3s_infinite]" />
              <div className="absolute w-1 h-1 bg-white rounded-full top-2/3 left-1/2 animate-[pulse_4s_infinite]" />
              <div className="absolute w-2 h-2 bg-[#D4AF37]/80 rounded-full blur-[2px] top-1/3 right-1/4 animate-[pulse_5s_infinite]" />
            </div>

            {/* Left-edge scrim */}
            <div className="absolute inset-0 z-[12] pointer-events-none bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent md:via-[#050505]/40" />

            {/* Giant Floating Sneaker */}
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-end md:pr-0 lg:pr-0 translate-x-[4vw] md:translate-x-[6vw] lg:translate-x-[8vw]">
              {slides.map((slide, index) => (
                <div
                  key={`img-${slide.id}`}
                  id={`img-wrapper-${slide.id}`}
                  style={{ transformStyle: "preserve-3d" }}
                  className={`absolute w-[112vw] h-[70vh] sm:w-[100vw] md:w-[90vw] md:h-[94vh] lg:w-[84vw] flex items-center justify-center transition-all duration-700 pointer-events-none ${
                    index === 0 ? "opacity-100 scale-100" : "opacity-0 scale-50"
                  }`}
                >
                  <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[58%] h-[7%] bg-black/70 rounded-[50%] blur-2xl animate-[pulse_5s_infinite]" />
                  <div className="absolute inset-[8%] bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent rounded-full pointer-events-none" />
                  <img
                    src={slide.image}
                    alt={`${slide.brand} ${slide.name}`}
                    className="object-contain drop-shadow-[0_45px_70px_rgba(0,0,0,0.85)] pointer-events-none select-none"
                    style={{
                      width: slide.isBag ? '60%' : '100%',
                      height: slide.isBag ? '60%' : '100%',
                      transform: 'rotate(-12deg) translateY(-5%)',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Left Editorial details */}
            <div className="relative z-30 w-full max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16">
              <div className="relative h-[22rem] md:h-[26rem] w-full md:w-[46%] lg:w-[40%] flex items-center">
                {slides.map((slide, index) => (
                  <div
                    key={`details-${slide.id}`}
                    id={`details-${slide.id}`}
                    className={`absolute inset-0 flex flex-col justify-center items-start text-left space-y-4 md:space-y-6 ${
                      index === 0 ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-black text-white leading-[0.9] uppercase tracking-tighter font-sans">
                      <span style={{ color: slide.accentColor }}>{slide.name}</span>
                    </h1>

                    <p className="text-neutral-400 max-w-sm text-xs sm:text-sm leading-relaxed">
                      {slide.desc || "Shop sneakers, bags & latest styles."}
                    </p>

                    <div className="flex flex-col gap-5 pt-1">
                      <Link
                        href={slide.shopLink}
                        className="px-7 py-3 bg-[#D4AF37] text-black font-extrabold text-[10px] uppercase tracking-widest transition-all rounded-lg flex items-center gap-2 hover:bg-[#EAC348] duration-300 active:scale-95 pointer-events-auto w-fit"
                      >
                        Shop Now <IoChevronForward className="text-sm" />
                      </Link>

                      <div className="flex items-center gap-1.5">
                        {slides.map((dot) => {
                          const isCurrent = dot.id === slide.id;
                          return (
                            <div
                              key={`dot-${dot.id}`}
                              className="h-1 rounded-full transition-all duration-300"
                              style={{
                                width: isCurrent ? "18px" : "6px",
                                backgroundColor: isCurrent ? slide.accentColor : "#333",
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tagline strip */}
            <div className="absolute bottom-6 left-6 sm:left-10 lg:left-16 z-40 pointer-events-none">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-600 max-w-xs leading-relaxed">
                The Rasa Store · Sneakers, bags &amp; latest styles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          2. MOBILE HERO OPTIMIZATION (block md:hidden)
          - Designed to match the exact mockup layout
          ───────────────────────────────────────────────────────────────────────── */}
      <div className="block md:hidden relative w-full h-auto bg-[#050505] overflow-hidden font-sans select-none border-b border-neutral-900/40 pb-8">
        
        {/* Ambient background blur behind the shoe */}
        <div 
          className="absolute top-[22%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] h-[85vw] rounded-full blur-[90px] transition-all duration-500 pointer-events-none opacity-30 z-0"
          style={{ backgroundColor: slides[activeMobileIndex].glowColor }}
        />

        {/* Giant Background Word for Mobile */}
        {slides.map((slide, index) => (
          <div
            key={`mobile-bg-text-${slide.id}`}
            className={`absolute inset-x-0 top-[6%] flex items-center justify-center pointer-events-none z-0 select-none transition-opacity duration-500 ${
              index === activeMobileIndex ? "opacity-30" : "opacity-0"
            }`}
          >
            <h2
              className="text-[38vw] font-black uppercase tracking-[-0.04em] text-center leading-none whitespace-nowrap select-none font-sans"
              style={{
                backgroundImage: slide.textGradient,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
                WebkitTextStroke: "1px rgba(212, 175, 55, 0.12)",
                filter: `drop-shadow(0 10px 40px ${slide.accentColor}33)`,
              }}
            >
              {slide.bgText}
            </h2>
          </div>
        ))}

        {/* Mobile Particles — removed for cleaner look */}

        {/* Ambient light lines/streaks */}
        <div className="absolute top-[28%] left-0 right-0 h-40 bg-gradient-to-r from-transparent via-[#D4AF37]/5 to-transparent skew-y-[-15deg] pointer-events-none z-0" />

        {/* Slides Content Container */}
        <div className="relative w-full flex flex-col justify-start px-6 z-10 pt-4">
          
          {/* 1. SHOE IMAGE - Centered, rotated -28deg */}
          <div className="relative w-full flex items-center justify-center h-[280px] pointer-events-none">
            {slides.map((slide, idx) => {
              const isCurrent = idx === activeMobileIndex;
              return (
                <div
                  key={`mobile-img-${slide.id}`}
                  className={`absolute w-[125vw] max-w-[500px] aspect-[4/3] flex items-center justify-center transition-all duration-450 ease-out ${
                    isCurrent 
                      ? "opacity-100 scale-100 rotate-0 translate-y-0" 
                      : "opacity-0 scale-75 rotate-[15deg] translate-y-4"
                  }`}
                >
                  {/* Subtle soft shadow beneath the shoe */}
                  <div className="absolute bottom-[4%] w-[75%] h-[8%] bg-black/60 rounded-[50%] blur-2xl" />
                  
                  {/* Sneaker Image with Gentle Levitation */}
                  <div 
                    className="w-full h-full flex items-center justify-center pointer-events-none"
                    style={{
                      animation: isCurrent ? 'mobileFloat 4s ease-in-out infinite' : 'none'
                    }}
                  >
                    <img
                      src={slide.image}
                      alt={slide.name}
                      className="object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.8)] select-none pointer-events-none"
                      style={{
                        width: slide.isBag ? "62%" : "85%",
                        height: slide.isBag ? "62%" : "85%",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Slider Dots - Centered directly under the shoe */}
          <div className="flex items-center justify-center gap-1.5 pb-6">
            {slides.map((slide, idx) => {
              const isCurrent = idx === activeMobileIndex;
              return (
                <button
                  key={`mobile-dot-${slide.id}`}
                  onClick={() => setActiveMobileIndex(idx)}
                  className="h-1 rounded-full transition-all duration-300 pointer-events-auto"
                  style={{
                    width: isCurrent ? "20px" : "14px",
                    backgroundColor: isCurrent ? slides[activeMobileIndex].accentColor : "#2c2c2c",
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              );
            })}
          </div>

          {/* 3. DETAILS & CTA */}
          <div className="w-full flex flex-col items-start text-left space-y-3 pt-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]/80">
              {slides[activeMobileIndex].brand}
            </p>
            <h1 className="text-3xl font-black text-white leading-tight uppercase tracking-tight">
              <span style={{ color: slides[activeMobileIndex].accentColor }}>
                {slides[activeMobileIndex].name}
              </span>
            </h1>

            <p className="text-neutral-500 text-xs leading-relaxed max-w-sm">
              {slides[activeMobileIndex].desc}
            </p>

            <Link
              href={slides[activeMobileIndex].shopLink}
              className="px-5 py-2.5 text-black font-extrabold text-[9px] uppercase tracking-[0.2em] rounded-lg transition-all active:scale-95 flex items-center gap-2 pointer-events-auto"
              style={{ backgroundColor: slides[activeMobileIndex].accentColor }}
            >
              Shop Now
              <IoChevronForward className="text-xs" />
            </Link>

            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-600 pt-2">
              The Rasa Store · Sneakers, bags &amp; latest styles
            </p>
          </div>
        </div>

        {/* Global style injection for mobile levitation */}
        <style jsx global>{`
          @keyframes mobileFloat {
            0%, 100% {
              transform: translateY(0px) rotate(-28deg) scale(1.1);
            }
            50% {
              transform: translateY(-8px) rotate(-26deg) scale(1.1);
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default HeroBanner;
