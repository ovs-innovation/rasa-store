import React from "react";
import { IoStar, IoCheckmarkCircle } from "react-icons/io5";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Aarav Sharma",
    role: "Collector & Sneakerhead",
    item: "Air Jordan 1 Retro High 'Chicago'",
    rating: 5,
    comment: "Absolutely flawless service. The authentication process is bulletproof, and the pair arrived in pristine condition. Finally, a reliable source for grails in India.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80",
  },
  {
    id: 2,
    name: "Riya Patel",
    role: "Verified Buyer",
    item: "Prada Cleo Brushed Leather Shoulder Bag",
    rating: 5,
    comment: "The shipping was incredibly fast, and the packaging felt premium. The item was authenticated perfectly. Rasa has completely upgraded my shopping experience.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80",
  },
  {
    id: 3,
    name: "Vikram Malhotra",
    role: "Fashion Stylist",
    item: "Yeezy Slide 'Bone'",
    rating: 5,
    comment: "Curated selection is top-notch. The Rasa edit only includes the most relevant drops. The interface is clean, transaction was seamless, and items are 100% legit.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-[#F3F3F3] border-t border-neutral-200/60">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-neutral-200 text-[#D4AF37] text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
            <span>Community Voice</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-sans font-black uppercase tracking-tight text-black mb-4">
            Trusted by Collectors
          </h2>
          <p className="text-sm text-neutral-500 font-sans">
            Hear from our global community of collectors, stylists, and enthusiasts who shop the Rasa edit daily.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 font-sans">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="group relative bg-white border border-neutral-200/60 rounded-2xl p-6 sm:p-8 hover:border-black transition-all duration-300 flex flex-col justify-between shadow-sm"
            >
              {/* Rating */}
              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <IoStar key={i} className="text-[#D4AF37] text-sm" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-neutral-700 text-sm leading-relaxed mb-6 italic">
                  "{t.comment}"
                </p>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 pt-6 border-t border-neutral-100 mt-auto">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-black tracking-tight flex items-center gap-1.5">
                    {t.name}
                    <IoCheckmarkCircle className="text-emerald-500 text-sm flex-shrink-0" title="Verified Purchase" />
                  </h4>
                  <div className="flex flex-col text-[10px] text-neutral-500">
                    <span className="font-medium">{t.role}</span>
                    <span className="text-[#D4AF37] font-bold truncate mt-0.5">{t.item}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
