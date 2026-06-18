import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IoChevronForward } from "react-icons/io5";

export const heroSlides = [
  {
    id: "01",
    brand: "Rasa",
    name: "Phantom Low",
    desc: "Elevate your daily rotation. Crafted from ultra-premium full-grain leather, featuring handmade stitching details and a custom-molded comfort sole.",
    image: "/shoes1.png",
    bgText: "PHANTOM",
    glowColor: "rgba(212, 175, 55, 0.25)",
    accentColor: "#D4AF37",
    textGradient: "linear-gradient(180deg, #F8E9A6 0%, #E7C765 28%, #D4AF37 55%, #9A7B22 80%, #6E5512 100%)",
    shopLink: "/search?category=footwear",
  },
  {
    id: "02",
    brand: "Rasa",
    name: "Vortex Runner",
    desc: "Unmatched performance meets modern streetwear aesthetics. Engineered mesh upper combined with responsive cushioning for all-day comfort.",
    image: "/shoes2.png",
    bgText: "VORTEX",
    glowColor: "rgba(59, 130, 246, 0.25)",
    accentColor: "#3B82F6",
    textGradient: "linear-gradient(180deg, #BFDBFE 0%, #60A5FA 35%, #3B82F6 60%, #1E40AF 100%)",
    shopLink: "/search?category=footwear",
  },
  {
    id: "03",
    brand: "Rasa",
    name: "Apex Court",
    desc: "A sleek reimagining of retro basketball heritage. Designed with multi-layered suede panels, breathable lining, and a durable traction grip.",
    image: "/shoes3.png",
    bgText: "APEX COURT",
    glowColor: "rgba(239, 68, 68, 0.25)",
    accentColor: "#EF4444",
    textGradient: "linear-gradient(180deg, #FECACA 0%, #F87171 35%, #EF4444 60%, #991B1B 100%)",
    shopLink: "/search?category=footwear",
  },
  {
    id: "04",
    brand: "Rasa",
    name: "Zenith Trail",
    desc: "Ready for any urban adventure. Weather-resistant premium overlays, high-traction lugs, and a lock-in lacing system for supreme support.",
    image: "/shoes4.png",
    bgText: "ZENITH",
    glowColor: "rgba(168, 85, 247, 0.25)",
    accentColor: "#A855F7",
    textGradient: "linear-gradient(180deg, #E9D5FF 0%, #C084FC 35%, #A855F7 60%, #6B21A8 100%)",
    shopLink: "/search?category=footwear",
  },
];

const HeroBanner = () => {
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
        heroSlides.forEach((slide, i) => {
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

        heroSlides.forEach((slide, i) => {
          if (i < heroSlides.length - 1) {
            const next = heroSlides[i + 1];

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
  }, []);

  // Mobile slideshow autoplay
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMobileIndex((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────────────
          1. DESKTOP HERO SECTION (md:block, 100% UNCHANGED)
          ───────────────────────────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        id="hero-section"
        className="hidden md:block relative w-full bg-[#050505] select-none font-sans"
        style={{ height: `${heroSlides.length * 135}vh` }}
      >
        {/* Sticky viewport frame */}
        <div
          ref={stickyRef}
          style={{ "--glow-color": heroSlides[0].glowColor }}
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
            {heroSlides.map((slide, index) => (
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
            <div className="absolute inset-0 pointer-events-none z-[3] opacity-40">
              <div className="absolute w-1.5 h-1.5 bg-[#D4AF37] rounded-full blur-[1px] top-1/4 left-2/3 animate-[pulse_3s_infinite]" />
              <div className="absolute w-1 h-1 bg-white rounded-full top-2/3 left-1/2 animate-[pulse_4s_infinite]" />
              <div className="absolute w-2 h-2 bg-[#D4AF37]/80 rounded-full blur-[2px] top-1/3 right-1/4 animate-[pulse_5s_infinite]" />
            </div>

            {/* Left-edge scrim */}
            <div className="absolute inset-0 z-[12] pointer-events-none bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent md:via-[#050505]/40" />

            {/* Giant Floating Sneaker */}
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-end md:pr-0 lg:pr-0 translate-x-[4vw] md:translate-x-[6vw] lg:translate-x-[8vw]">
              {heroSlides.map((slide, index) => (
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
                    className="w-full h-full object-contain drop-shadow-[0_45px_70px_rgba(0,0,0,0.85)] pointer-events-none transform -rotate-12 select-none"
                  />
                </div>
              ))}
            </div>

            {/* Left Editorial details */}
            <div className="relative z-30 w-full max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16">
              <div className="relative h-[22rem] md:h-[26rem] w-full md:w-[46%] lg:w-[40%] flex items-center">
                {heroSlides.map((slide, index) => (
                  <div
                    key={`details-${slide.id}`}
                    id={`details-${slide.id}`}
                    className={`absolute inset-0 flex flex-col justify-center items-start text-left space-y-4 md:space-y-6 ${
                      index === 0 ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F0F0F]/80 border border-neutral-800 text-[#D4AF37] text-[9px] font-black uppercase tracking-widest rounded-full backdrop-blur-sm">
                      <span>Drop {slide.id}</span>
                      <span className="text-[6px] text-[#D4AF37]">●</span>
                    </div>

                    <h1 className="text-5xl sm:text-[80px] font-black text-white leading-[0.82] uppercase tracking-tighter font-sans drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                      Rasa <br />
                      <span style={{ color: slide.accentColor }}>{slide.name}</span>
                    </h1>

                    <p className="text-neutral-300 max-w-xs text-xs sm:text-sm font-normal leading-relaxed">
                      {slide.desc}
                    </p>

                    <div className="flex flex-col gap-6 pt-2">
                      <div>
                        <Link
                          href={slide.shopLink}
                          className="px-8 py-3.5 bg-white text-black font-extrabold text-[11px] uppercase tracking-widest transition-all rounded-md flex items-center gap-2 hover:bg-[#D4AF37] hover:text-black duration-300 shadow-lg hover:scale-105 active:scale-95 pointer-events-auto"
                        >
                          Shop Collection <span className="font-sans font-light">&gt;</span>
                        </Link>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {heroSlides.map((dot) => {
                          const isCurrent = dot.id === slide.id;
                          return (
                            <div
                              key={`dot-${dot.id}`}
                              className="h-1.5 rounded-full transition-all duration-300"
                              style={{
                                width: isCurrent ? "20px" : "6px",
                                backgroundColor: isCurrent ? slide.accentColor : "#404040",
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

            {/* Counter */}
            <div className="absolute bottom-8 right-8 flex flex-col items-end gap-1 pointer-events-none z-40">
              {heroSlides.map((slide, i) => (
                <div key={slide.id} className="flex items-center gap-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-neutral-600">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="w-8 h-px bg-neutral-800" />
                </div>
              ))}
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-40">
              <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500">
                Scroll to reveal drops
              </span>
              <div className="w-1 h-8 bg-neutral-900 rounded-full relative overflow-hidden border border-neutral-800">
                <div className="absolute w-full h-1/3 bg-[#D4AF37] rounded-full animate-[bounce_2s_infinite]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          2. MOBILE HERO OPTIMIZATION (block md:hidden)
          - Max height 85vh to 90vh to fit completely in the first fold
          - Main focus on a large centered floating shoe
          - Compact details layout and full-width CTA visible instantly
          ───────────────────────────────────────────────────────────────────────── */}
      <div className="block md:hidden relative w-full h-[calc(100vh-64px)] min-h-[540px] bg-[#050505] overflow-hidden font-sans select-none border-b border-neutral-900/40">
        
        {/* Ambient background blur behind the shoe */}
        <div 
          className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full blur-[90px] transition-all duration-500 pointer-events-none opacity-30 z-0"
          style={{ backgroundColor: heroSlides[activeMobileIndex].glowColor }}
        />

        {/* Giant low-opacity background watermark (hidden on very small screens, max 5-8% opacity) */}
        <div className="absolute inset-x-0 top-[20%] hidden sm:flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden opacity-[0.05]">
          <h2 className="text-[24vw] font-black uppercase tracking-tighter leading-none whitespace-nowrap">
            {heroSlides[activeMobileIndex].bgText}
          </h2>
        </div>

        {/* Slides Content Container */}
        <div className="relative w-full h-full flex flex-col justify-between pt-8 pb-5 px-6 z-10">
          
          {/* 1. SHOE IMAGE - Hero focus, occupies most of first screen, auto height maintain, centered */}
          <div className="relative flex-1 w-full flex items-center justify-center min-h-[220px] max-h-[45vh] pointer-events-none">
            {heroSlides.map((slide, idx) => {
              const isCurrent = idx === activeMobileIndex;
              return (
                <div
                  key={`mobile-img-${slide.id}`}
                  className={`absolute w-[145vw] max-w-[600px] aspect-[4/3] flex items-center justify-center transition-all duration-450 ease-out ${
                    isCurrent 
                      ? "opacity-100 scale-100 rotate-0 translate-y-0" 
                      : "opacity-0 scale-75 rotate-[15deg] translate-y-4"
                  }`}
                >
                  {/* Subtle soft shadow beneath the shoe */}
                  <div className="absolute bottom-[2%] w-[80%] h-[10%] bg-black/60 rounded-[50%] blur-2xl" />
                  
                  {/* Sneaker Image with Gentle Levitation */}
                  <img
                    src={slide.image}
                    alt={slide.name}
                    className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)] select-none pointer-events-none"
                    style={{
                      animation: isCurrent ? 'mobileFloat 4s ease-in-out infinite' : 'none'
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* 2-6. DETAILS, CTA AND SLIDER DOTS */}
          <div className="w-full flex flex-col items-center text-center space-y-4 pt-2">
            
            {/* 2. Drop badge */}
            <div className="inline-flex items-center px-3 py-1 bg-[#0F0F0F] border border-neutral-900 text-[#D4AF37] text-[8px] font-black uppercase tracking-[0.2em] rounded-full">
              Drop {heroSlides[activeMobileIndex].id}
            </div>

            {/* 3. Product Name (Max 2 lines) */}
            <h1 className="text-3xl font-black text-white leading-none uppercase tracking-tight max-w-[90%] line-clamp-2">
              RASA{" "}
              <span style={{ color: heroSlides[activeMobileIndex].accentColor }}>
                {heroSlides[activeMobileIndex].name}
              </span>
            </h1>

            {/* 4. Short Description (Max 2 lines) */}
            <p className="text-neutral-400 text-[11px] leading-relaxed max-w-sm px-2 line-clamp-2">
              {heroSlides[activeMobileIndex].desc}
            </p>

            {/* 5. CTA Button - Large, 90% width, thumb-friendly, dynamic color, visible without scrolling */}
            <Link
              href={heroSlides[activeMobileIndex].shopLink}
              className="w-[90vw] max-w-[360px] py-3.5 text-black font-extrabold text-[11px] uppercase tracking-[0.2em] text-center rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 pointer-events-auto duration-300"
              style={{
                backgroundColor: heroSlides[activeMobileIndex].accentColor,
                boxShadow: `0 8px 30px ${heroSlides[activeMobileIndex].accentColor}33`,
              }}
            >
              <span>Shop Collection</span>
              <IoChevronForward className="text-xs stroke-[3px]" />
            </Link>

            {/* 6. Slider Dots */}
            <div className="flex items-center gap-2 pt-1">
              {heroSlides.map((slide, idx) => {
                const isCurrent = idx === activeMobileIndex;
                return (
                  <button
                    key={`mobile-dot-${slide.id}`}
                    onClick={() => setActiveMobileIndex(idx)}
                    className="h-1 rounded-full transition-all duration-300 pointer-events-auto"
                    style={{
                      width: isCurrent ? "18px" : "6px",
                      backgroundColor: isCurrent ? heroSlides[activeMobileIndex].accentColor : "#333",
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Global style injection for mobile levitation */}
        <style jsx global>{`
          @keyframes mobileFloat {
            0%, 100% {
              transform: translateY(0px) rotate(-12deg);
            }
            50% {
              transform: translateY(-8px) rotate(-10deg);
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default HeroBanner;
