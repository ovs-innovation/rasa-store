import { IoStar } from "react-icons/io5";
import HomeSection, { HomeEyebrow, HomeTitle } from "@components/common/HomeSection";

const DEFAULT_REVIEWS = [
  {
    name: "Aarav S.",
    role: "Verified Buyer",
    item: "Sneakers",
    rating: 5,
    comment: "Great quality and fast delivery. Exactly what I ordered — will shop again.",
    avatar: "",
  },
  {
    name: "Riya P.",
    role: "Verified Buyer",
    item: "Crossbody Bag",
    rating: 5,
    comment: "Love the bag! Packaging was neat and the product matched the photos perfectly.",
    avatar: "",
  },
  {
    name: "Vikram M.",
    role: "Repeat Customer",
    item: "Streetwear Drop",
    rating: 5,
    comment: "Best prices I've found online. WhatsApp support was super helpful with sizing.",
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

const HomeReviewsSection = ({
  reviews = [],
  section = {},
  enabled = true,
}) => {
  if (enabled === false) return null;

  const displayReviews = (reviews?.length ? reviews : DEFAULT_REVIEWS)
    .filter((r) => r?.comment?.trim())
    .slice(0, 6);

  if (!displayReviews.length) return null;

  const eyebrow = section?.eyebrow || "Reviews";
  const title = section?.title || "What Customers Say";
  const subtitle =
    section?.subtitle || "Real feedback from shoppers who bought from Rasa Store.";

  return (
    <HomeSection className="bg-[#0A0A0A] border-t border-neutral-900/80">
      <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
        {eyebrow && <HomeEyebrow>{eyebrow}</HomeEyebrow>}
        <HomeTitle className="mb-3">{title}</HomeTitle>
        {subtitle && <p className="rasa-subtext mx-auto">{subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {displayReviews.map((review, idx) => {
          const rating = Math.min(5, Math.max(1, Number(review.rating) || 5));
          return (
            <article
              key={review.id || `${review.name}-${idx}`}
              className="rasa-surface flex flex-col p-5 sm:p-6"
            >
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <IoStar
                    key={i}
                    className={`text-sm ${i < rating ? "text-[#D4AF37]" : "text-neutral-700"}`}
                  />
                ))}
              </div>

              <p className="text-sm text-neutral-300 leading-relaxed mb-5 flex-1">
                &ldquo;{review.comment}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-neutral-900/80">
                {review.avatar ? (
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-10 h-10 rounded-full object-cover border border-neutral-800"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#141414] border border-neutral-800 flex items-center justify-center text-[11px] font-black text-[#D4AF37]">
                    {getInitials(review.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{review.name}</p>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider truncate">
                    {review.role || "Customer"}
                    {review.item ? ` · ${review.item}` : ""}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </HomeSection>
  );
};

export default HomeReviewsSection;
