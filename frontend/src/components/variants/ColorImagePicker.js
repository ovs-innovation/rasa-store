const normalizeColor = (value = "") => String(value).trim().toLowerCase();

const ColorImagePicker = ({
  options = [],
  selectedColor,
  onSelect,
}) => {
  if (!options.length) return null;

  const selectedKey = normalizeColor(selectedColor);

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option, idx) => {
        const isSelected = selectedKey === normalizeColor(option.color);
        const isDisabled = !option.hasStock;

        return (
          <button
            key={`${option.color}-${idx}`}
            type="button"
            disabled={isDisabled}
            onClick={(e) => {
              e.preventDefault();
              if (!isDisabled) onSelect(option.color);
            }}
            title={option.label}
            aria-label={option.label}
            aria-pressed={isSelected}
            className="flex flex-col items-center gap-1.5 group"
          >
            <span
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                isDisabled
                  ? "opacity-40 cursor-not-allowed border-neutral-800"
                  : isSelected
                  ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30 scale-105"
                  : "border-neutral-700 group-hover:border-neutral-500"
              }`}
            >
              {option.image ? (
                <img
                  src={option.image}
                  alt={option.label}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="flex items-center justify-center w-full h-full bg-neutral-800 text-xs text-neutral-400 px-1 text-center">
                  {option.label}
                </span>
              )}
            </span>
            <span
              className={`text-[11px] max-w-16 truncate text-center ${
                isSelected ? "text-[#D4AF37]" : "text-neutral-400"
              }`}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ColorImagePicker;
