import Link from "next/link";

const HomeSection = ({
  children,
  className = "",
  innerClassName = "",
  fullBleed = false,
}) => (
  <section className={`py-12 md:py-16 lg:py-20 ${className}`}>
    {fullBleed ? (
      children
    ) : (
      <div className={`mx-auto max-w-screen-2xl px-4 sm:px-8 ${innerClassName}`}>
        {children}
      </div>
    )}
  </section>
);

export const HomeEyebrow = ({ children }) => (
  <p className="rasa-eyebrow mb-3">{children}</p>
);

export const HomeTitle = ({ children, className = "" }) => (
  <h2 className={`rasa-heading ${className}`}>{children}</h2>
);

export const HomeViewAll = ({ href, label = "View All" }) => (
  <Link
    href={href}
    className="rasa-link-pill group inline-flex items-center gap-1.5 shrink-0"
  >
    <span>{label}</span>
    <span className="text-[#D4AF37] transition-transform group-hover:translate-x-0.5">→</span>
  </Link>
);

export default HomeSection;
