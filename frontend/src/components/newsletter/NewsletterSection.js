import { useState } from "react";
import NewsletterServices from "@services/NewsletterServices";
import { notifyError, notifySuccess } from "@utils/toast";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      notifyError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await NewsletterServices.addNewsletter({ email });
      notifySuccess("You're on the list. Welcome to RASA.");
      setEmail("");
    } catch (err) {
      notifyError(err?.response?.data?.message || err.message || "Subscription failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-[#0A0A0A] border-y border-neutral-900">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-[#111111] px-6 py-10 sm:px-10 sm:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(212,175,55,0.12),transparent_55%)] pointer-events-none" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <span className="inline-flex items-center px-3 py-1.5 bg-[#0F0F0F] border border-neutral-800 text-[#D4AF37] text-[9px] font-black uppercase tracking-[0.25em] rounded-full mb-4">
                Newsletter
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-3">
                Stay Ahead of Every Drop
              </h2>
              <p className="text-sm text-neutral-400 max-w-xl leading-relaxed">
                Get early access to new arrivals, exclusive releases, and limited sneaker drops before they sell out.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 h-12 px-4 bg-[#050505] border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]/60"
              />
              <button
                type="submit"
                disabled={loading}
                className="h-12 px-8 bg-[#D4AF37] hover:bg-[#e3c456] text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-lg transition-colors disabled:opacity-60"
              >
                {loading ? "Joining..." : "Subscribe"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
