import { useEffect, useRef, useState } from "react";
import { IoStar, IoCheckmarkCircle } from "react-icons/io5";
import { TbQuote } from "react-icons/tb";

const REVIEWS = [
  {
    id: 1,
    name: "Arjun M.",
    location: "Mumbai",
    initials: "AM",
    rating: 5,
    date: "June 2025",
    text: "Ordered the bag and it arrived in 2 days. Packaging was insane — felt like opening a luxury gift. Quality is 10/10, no complaints at all.",
    product: "Soleste Tote Bag",
    verified: true,
  },
  {
    id: 2,
    name: "Priya S.",
    location: "Delhi",
    initials: "PS",
    rating: 5,
    date: "May 2025",
    text: "The sneakers I got are exactly as shown — clean colourway, perfect fit. RASA Store has become my go-to for finding pieces that actually match the pictures.",
    product: "Nikke Runner",
    verified: true,
  },
  {
    id: 3,
    name: "Rahul K.",
    location: "Bangalore",
    initials: "RK",
    rating: 5,
    date: "June 2025",
    text: "Was skeptical at first but the unboxing video policy gave me confidence. Got exactly what I ordered. Will definitely shop again!",
    product: "Pinnacle Crossbody",
    verified: true,
  },
  {
    id: 4,
    name: "Sneha R.",
    location: "Chennai",
    initials: "SR",
    rating: 5,
    date: "April 2025",
    text: "Customer service was super responsive. Had a small query about sizing and they replied within minutes. The bag is absolutely gorgeous.",
    product: "Heritage Shoulder Bag",
    verified: true,
  },
  {
    id: 5,
    name: "Vikram T.",
    location: "Hyderabad",
    initials: "VT",
    rating: 5,
    date: "May 2025",
    text: "These guys know their stuff. Every item is curated properly — no random filler products. My sneakers are absolutely fire!",
    product: "Balanse Low-Top",
    verified: true,
  },
  {
    id: 6,
    name: "Ananya D.",
    location: "Pune",
    initials: "AD",
    rating: 5,
    date: "June 2025",
    text: "Bought a bag as a gift for my sister. She absolutely loved it. The quality exceeded expectations at this price point. Thank you RASA!",
    product: "Equinox Evening Clutch",
    verified: true,
  },
];

const STATS = [
  { value: "5,000+", label: "Happy Customers" },
  { value: "5.0★", label: "Average Rating" },
  { value: "100%", label: "Verified Reviews" },
];

const Stars = () => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <IoStar key={s} className="text-[#D4AF37] text-xs" />
    ))}
  </div>
);

const ReviewCard = ({ review }) => (
  <div className="relative flex flex-col justify-between gap-4 rounded-xl border border-neutral-800 bg-[#0F0F0F] p-6 hover:border-[#D4AF37]/50 transition-all duration-300 w-[350px] shrink-0">
    {/* Top part */}
    <div>
      <div className="flex justify-between items-center mb-3">
        <Stars />
        <span className="text-neutral-600 text-[10px]">{review.date}</span>
      </div>
      <p className="text-neutral-300 text-xs leading-relaxed italic">
        &ldquo;{review.text}&rdquo;
      </p>
    </div>

    {/* Bottom part */}
    <div className="mt-4 pt-3 border-t border-neutral-900 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/20 flex items-center justify-center shrink-0">
          <span className="text-[#D4AF37] text-[10px] font-black">{review.initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-white text-xs font-black truncate">{review.name}</span>
            {review.verified && (
              <IoCheckmarkCircle className="text-[#D4AF37] text-[12px] shrink-0" />
            )}
          </div>
          <p className="text-neutral-500 text-[9px] uppercase tracking-widest">{review.location}</p>
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-full w-fit">
        <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />
        <span className="text-neutral-400 text-[8px] uppercase tracking-widest font-bold">{review.product}</span>
      </div>
    </div>
  </div>
);

export default function CustomerReviewSection() {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const posRef = useRef(0);
  const rafRef = useRef(null);
  const SPEED = 0.5;
  const doubledReviews = [...REVIEWS, ...REVIEWS, ...REVIEWS];

  // Mobile slideshow state
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);

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

  // Mobile slideshow auto-play timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMobileIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-8 md:py-16 bg-[#050505] border-t border-neutral-900 overflow-hidden font-sans">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="text-center mb-6 md:mb-10">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mb-2">
            Customer Reviews
          </p>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.12em] text-white">
            What Our Customers Say
          </h2>
          <div className="h-[2px] w-12 bg-[#D4AF37] mx-auto mt-4" />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 md:mb-10 max-w-3xl mx-auto">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center py-4 px-3 rounded-lg bg-[#0F0F0F] border border-neutral-800">
              <span className="text-xl sm:text-2xl font-black text-white">{stat.value}</span>
              <span className="text-[9px] uppercase tracking-widest text-neutral-500 mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop View: Scrolling Marquee Row */}
      <div 
        className="hidden md:block relative overflow-hidden py-2"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Left & Right Gradients for smooth fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

        <div 
          ref={trackRef} 
          className="flex gap-4" 
          style={{ willChange: "transform", width: "max-content" }}
        >
          {doubledReviews.map((r, i) => (
            <ReviewCard key={`${r.id}-${i}`} review={r} />
          ))}
        </div>
      </div>

      {/* Mobile View: 1 Card Slide Show */}
      <div className="block md:hidden px-6">
        <div className="relative overflow-hidden w-full min-h-[220px] flex items-center justify-center">
          {REVIEWS.map((review, idx) => {
            const isCurrent = idx === activeMobileIndex;
            return (
              <div
                key={review.id}
                className={`absolute w-full max-w-[340px] transition-all duration-500 ease-in-out ${
                  isCurrent
                    ? "opacity-100 scale-100 translate-x-0 relative z-10"
                    : "opacity-0 scale-95 translate-x-12 absolute pointer-events-none z-0"
                }`}
              >
                <ReviewCard review={review} />
              </div>
            );
          })}
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-1.5 mt-5">
          {REVIEWS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveMobileIndex(idx)}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: idx === activeMobileIndex ? "18px" : "6px",
                backgroundColor: idx === activeMobileIndex ? "#D4AF37" : "#333",
              }}
              aria-label={`Go to review ${idx + 1}`}
            />
          ))}
        </div>
      </div>

    </section>
  );
}
