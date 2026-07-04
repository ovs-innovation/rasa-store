import { useState } from "react";
import NewsletterServices from "@services/NewsletterServices";
import { notifyError, notifySuccess } from "@utils/toast";
import HomeSection, { HomeEyebrow, HomeTitle } from "@components/common/HomeSection";

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
      notifySuccess("You're on the list.");
      setEmail("");
    } catch (err) {
      notifyError(err?.response?.data?.message || err.message || "Subscription failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomeSection className="bg-[#050505] border-t border-neutral-900/60">
      <div className="rasa-surface px-6 py-10 sm:px-10 sm:py-12 max-w-3xl mx-auto text-center">
        <HomeEyebrow>Stay updated</HomeEyebrow>
        <HomeTitle className="!text-2xl sm:!text-3xl mb-3">Get drop alerts</HomeTitle>
        <p className="rasa-subtext mx-auto mb-6">
          New arrivals and restocks — straight to your inbox. No spam.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="flex-1 h-11 px-4 bg-black border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="h-11 px-6 bg-[#D4AF37] hover:bg-[#EAC348] text-black text-[10px] font-black uppercase tracking-widest rounded-lg transition-all disabled:opacity-60"
          >
            {loading ? "..." : "Subscribe"}
          </button>
        </form>
      </div>
    </HomeSection>
  );
};

export default NewsletterSection;
