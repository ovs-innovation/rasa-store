import { useEffect, useRef, useState } from "react";
import { IoStar, IoCheckmarkCircle } from "react-icons/io5";

const DEFAULT_REVIEWS = [
  {
    name: "Arjun M.",
    role: "Mumbai",
    item: "Soleste Tote Bag",
    rating: 5,
    comment:
      "Ordered the bag and it arrived in 2 days. Packaging was insane — felt like opening a luxury gift. Quality is 10/10, no complaints at all.",
    date: "June 2025",
    avatar: "",
  },
  {
    name: "Priya S.",
    role: "Delhi",
    item: "Nikke Runner",
    rating: 5,
    comment:
      "The sneakers I got are exactly as shown — clean colourway, perfect fit. Rasa Store has become my go-to for finding pieces that actually match the pictures.",
    date: "May 2025",
    avatar: "",
  },
  {
    name: "Vikram T.",
    role: "Hyderabad",
    item: "Balanse Low-Top",
    rating: 5,
    comment:
      "These guys know their stuff. Every item is curated properly — no random filler products. My sneakers are absolutely fire!",
    date: "May 2025",
    avatar: "",
  },
  {
    name: "Sneha R.",
    role: "Chennai",
    item: "Heritage Shoulder Bag",
    rating: 5,
    comment:
      "Customer service was super responsive. Had a small query about sizing and they replied within minutes. The bag is absolutely gorgeous.",
    date: "April 2025",
    avatar: "",
  },
];

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "R";

const normalizeReview = (review, idx) => ({
  id: review.id || `review-${idx}`,
  name: review.name || "Customer",
  location: review.location || review.role || "Verified Buyer",
  initials: getInitials(review.name),
  rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
  date: review.date || "",
  text: review.comment || "",
  product: review.item || "",
  verified: true,
  avatar: review.avatar || "",
});

const Stars = ({ rating = 5 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <IoStar
        key={s}
        className={`text-xs ${s <= rating ? "text-[#D4AF37]" : "text-neutral-700"}`}
      />
    ))}
  </div>
);

const ReviewCard = ({ review }) => (
  <div className="relative flex w-full max-w-[350px] shrink-0 flex-col justify-between gap-4 rounded-xl border border-neutral-800 bg-[#0F0F0F] p-6 transition-all duration-300 hover:border-[#D4AF37]/50 md:w-[350px]">
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Stars rating={review.rating} />
        {review.date ? (
          <span className="text-[10px] text-neutral-600">{review.date}</span>
        ) : null}
      </div>
      <p className="text-xs italic leading-relaxed text-neutral-300">
        &ldquo;{review.text}&rdquo;
      </p>
    </div>

    <div className="mt-4 flex flex-col gap-3 border-t border-neutral-900 pt-3">
      <div className="flex items-center gap-3">
        {review.avatar ? (
          <img
            src={review.avatar}
            alt={review.name}
            className="h-8 w-8 shrink-0 rounded-full border border-[#D4AF37]/20 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/20 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5">
            <span className="text-[10px] font-black text-[#D4AF37]">{review.initials}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-xs font-black text-white">{review.name}</span>
            {review.verified && (
              <IoCheckmarkCircle className="shrink-0 text-[12px] text-[#D4AF37]" />
            )}
          </div>
          <p className="text-[9px] uppercase tracking-widest text-neutral-500">
            {review.location}
          </p>
        </div>
      </div>

      {review.product ? (
        <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5">
          <span className="h-1 w-1 rounded-full bg-[#D4AF37]" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400">
            {review.product}
          </span>
        </div>
      ) : null}
    </div>
  </div>
);

const HomeReviewsSection = ({
  reviews = [],
  section = {},
  enabled = true,
}) => {
  if (enabled === false) return null;

  const displayReviews = (reviews?.length ? reviews : DEFAULT_REVIEWS)
    .filter((r) => r?.comment?.trim())
    .slice(0, 8)
    .map(normalizeReview);

  if (!displayReviews.length) return null;

  const eyebrow = section?.eyebrow || "Customer Reviews";
  const title = section?.title || "What Our Customers Say";

  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const posRef = useRef(0);
  const rafRef = useRef(null);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);

  const marqueeReviews =
    displayReviews.length >= 3
      ? [...displayReviews, ...displayReviews, ...displayReviews]
      : [...displayReviews, ...displayReviews];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || displayReviews.length < 2) return undefined;

    const SPEED = 0.5;
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
  }, [paused, displayReviews.length]);

  useEffect(() => {
    if (displayReviews.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveMobileIndex((prev) => (prev + 1) % displayReviews.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [displayReviews.length]);

  return (
    <section className="overflow-hidden border-t border-neutral-900 bg-[#050505] py-8 font-sans md:py-16">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-8">
        <div className="mb-6 text-center md:mb-10">
          <p className="mb-2 text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">
            {eyebrow}
          </p>
          <h2 className="text-2xl font-black uppercase tracking-[0.12em] text-white sm:text-3xl">
            {title}
          </h2>
          <div className="mx-auto mt-4 h-[2px] w-12 bg-[#D4AF37]" />
        </div>
      </div>

      <div
        className="relative hidden overflow-hidden py-2 md:block"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-24 bg-gradient-to-r from-[#050505] to-transparent" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-24 bg-gradient-to-l from-[#050505] to-transparent" />

        <div
          ref={trackRef}
          className="flex gap-4"
          style={{ willChange: "transform", width: "max-content" }}
        >
          {marqueeReviews.map((review, i) => (
            <ReviewCard key={`${review.id}-${i}`} review={review} />
          ))}
        </div>
      </div>

      <div className="block px-4 md:hidden">
        <div className="relative flex min-h-[240px] w-full items-center justify-center overflow-hidden">
          {displayReviews.map((review, idx) => {
            const isCurrent = idx === activeMobileIndex;
            return (
              <div
                key={review.id}
                className={`w-full max-w-[340px] transition-all duration-500 ease-in-out ${
                  isCurrent
                    ? "relative z-10 scale-100 opacity-100"
                    : "pointer-events-none absolute z-0 scale-95 opacity-0"
                }`}
              >
                <ReviewCard review={review} />
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex justify-center gap-1.5">
          {displayReviews.map((_, idx) => (
            <button
              key={idx}
              type="button"
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
};

export default HomeReviewsSection;
