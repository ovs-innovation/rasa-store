import React from "react";
import useGetSetting from "@hooks/useGetSetting";
import { getPalette } from "@utils/themeColors";
import CMSkeleton from "@components/preloader/CMSkeleton";
import useUtilsFunction from "@hooks/useUtilsFunction";

const SectionHeader = ({ title, subtitle, loading = false, error = null, align = "left", className = "mb-12" }) => {
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const storeColor = storeCustomizationSetting?.theme?.color || "green";
  const palette = getPalette(storeColor);
  
  // Helper function to get display value (handles both strings and translation objects)
  const getDisplayValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") return showingTranslateValue(value);
    return String(value);
  };

  const alignmentClass = align === "center" ? "text-center" : "text-left";
  const containerClass = align === "center" ? "justify-center" : "justify-start";

  const displayTitle = getDisplayValue(title);
  const displaySubtitle = subtitle ? getDisplayValue(subtitle) : "";

  return (
    <div className={`${alignmentClass} ${className}`}>
      <h2 
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-widest text-current mb-4 leading-none" 
      >
        {loading ? (
          <CMSkeleton count={1} height={40} loading={loading} data="" />
        ) : (
          displayTitle
        )}
      </h2>
      {displaySubtitle && (
        <p className={`text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed ${align === "center" ? "max-w-2xl mx-auto" : ""}`}>
          {loading ? (
            <CMSkeleton count={2} height={10} error={error} loading={loading} data="" />
          ) : (
            displaySubtitle
          )}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;

