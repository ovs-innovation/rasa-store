import { HomeEyebrow, HomeTitle } from "@components/common/HomeSection";

const CatalogPageLayout = ({
  eyebrow,
  title,
  description,
  count = 0,
  countLabel = "items",
  emptyMessage = "No products found.",
  children,
}) => (
  <div className="bg-[#050505] min-h-screen pb-16">
    <div className="border-b border-neutral-900/80 py-12 md:py-14 px-4 text-center">
      {eyebrow && <HomeEyebrow>{eyebrow}</HomeEyebrow>}
      <HomeTitle className="!text-3xl md:!text-4xl mb-3">{title}</HomeTitle>
      {description && (
        <p className="rasa-subtext mx-auto max-w-md">{description}</p>
      )}
    </div>

    <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 pt-8">
      <div className="flex justify-between items-center mb-6 border-b border-neutral-900/80 pb-4">
        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
          {count} {countLabel}
        </span>
      </div>

      {count === 0 ? (
        <div className="text-center py-20 text-neutral-600 text-xs font-bold uppercase tracking-widest">
          {emptyMessage}
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

export default CatalogPageLayout;
