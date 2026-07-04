import React from "react";
import useGetSetting from "@hooks/useGetSetting";
import CMSkeleton from "@components/preloader/CMSkeleton";
import useUtilsFunction from "@hooks/useUtilsFunction";

const SectionHeader = ({
  title,
  subtitle,
  loading = false,
  error = null,
  align = "left",
  className = "mb-8",
}) => {
  const { showingTranslateValue } = useUtilsFunction();

  const getDisplayValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") return showingTranslateValue(value);
    return String(value);
  };

  const alignmentClass = align === "center" ? "text-center" : "text-left";
  const displayTitle = getDisplayValue(title);
  const displaySubtitle = subtitle ? getDisplayValue(subtitle) : "";

  return (
    <div className={`${alignmentClass} ${className}`}>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-[0.1em] text-white mb-2 leading-tight">
        {loading ? (
          <CMSkeleton count={1} height={32} loading={loading} data="" />
        ) : (
          displayTitle
        )}
      </h2>
      {displaySubtitle && (
        <p
          className={`text-xs text-neutral-500 leading-relaxed ${
            align === "center" ? "max-w-md mx-auto" : "max-w-lg"
          }`}
        >
          {loading ? (
            <CMSkeleton count={1} height={10} error={error} loading={loading} data="" />
          ) : (
            displaySubtitle
          )}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
