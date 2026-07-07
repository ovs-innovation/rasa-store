import useUtilsFunction from "@hooks/useUtilsFunction";

const VariantList = ({
  att,
  option,
  variants,
  setValue,
  varTitle,
  selectVariant,
  setSelectVariant,
  setSelectVa,
}) => {
  const { showingTranslateValue } = useUtilsFunction();

  const getAttributeMeta = (attributeId) =>
    varTitle?.find((attr) => attr._id === attributeId);

  const isColorAttribute = (attributeId) => {
    const name =
      getAttributeMeta(attributeId)?.title?.en?.toLowerCase() ||
      getAttributeMeta(attributeId)?.name?.en?.toLowerCase() ||
      "";
    return name.includes("color") || name.includes("colour");
  };

  const isSizeAttribute = (attributeId) => {
    const name =
      getAttributeMeta(attributeId)?.title?.en?.toLowerCase() ||
      getAttributeMeta(attributeId)?.name?.en?.toLowerCase() ||
      "";
    return name.includes("size");
  };

  const isOptionAvailable = (attributeId, valueId) => {
    if (!Array.isArray(variants) || variants.length === 0) return false;

    const attributeIds = (varTitle || []).map((a) => a._id);
    const rawSelection = selectVariant || {};
    const selection = {};
    attributeIds.forEach((id) => {
      if (rawSelection?.[id]) selection[id] = rawSelection[id];
    });

    return variants.some((variant) => {
      if (variant[attributeId] !== valueId) return false;
      if (Number(variant.quantity) <= 0) return false;
      return Object.keys(selection).every((key) => {
        if (key === attributeId) return true;
        const selectedVal = selection[key];
        if (!selectedVal) return true;
        return variant[key] === selectedVal;
      });
    });
  };

  const handleChangeVariant = (valueId) => {
    setValue(valueId || att);
    const updatedSelection = { ...selectVariant, [att]: valueId };
    setSelectVariant(updatedSelection);
    setSelectVa(updatedSelection);
  };

  const uniqueOptions = [
    ...new Map(
      variants?.map((v) => [v[att], v]).filter(([, v]) => Boolean(v))
    ).values(),
  ];

  const optionItems = uniqueOptions
    .map((vl) => {
      const attribute = getAttributeMeta(att);
      const valueId = vl[att];
      if (!valueId) return null;

      const variantOption =
        attribute?.variants?.find((el) => el._id === valueId) ||
        attribute?.variants?.find(
          (el) =>
            showingTranslateValue(el.name) === valueId ||
            el.name?.en === valueId
        ) || { _id: valueId, name: { en: valueId } };

      const isSelected = Object.values(selectVariant || {}).includes(valueId);
      const isDisabled = !isOptionAvailable(att, valueId);

      return {
        id: variantOption._id || valueId,
        name: showingTranslateValue(variantOption.name) || valueId,
        hexColor: variantOption.hexColor,
        valueId,
        isSelected,
        isDisabled,
      };
    })
    .filter(Boolean);

  if (option === "Dropdown") {
    return (
      <select
        onChange={(e) => handleChangeVariant(e.target.value)}
        value={selectVariant?.[att] || ""}
        className="w-full max-w-xs h-10 px-3 text-sm rounded-lg bg-neutral-900 border border-neutral-700 text-white outline-none focus:border-[#D4AF37]/50"
      >
        <option value="" disabled>
          Select
        </option>
        {optionItems.map((item) => (
          <option key={item.id} value={item.valueId} disabled={item.isDisabled}>
            {item.name}
            {item.isDisabled ? " (Out of stock)" : ""}
          </option>
        ))}
      </select>
    );
  }

  const isColor = isColorAttribute(att);
  const isSize = isSizeAttribute(att);

  return (
    <div className="flex flex-wrap gap-2">
      {optionItems.map((item) => {
        if (isColor && item.hexColor) {
          return (
            <button
              key={item.id}
              type="button"
              disabled={item.isDisabled}
              onClick={(e) => {
                e.preventDefault();
                if (!item.isDisabled) handleChangeVariant(item.valueId);
              }}
              title={item.name}
              aria-label={item.name}
              className={`w-9 h-9 rounded-full border-2 transition-all ${
                item.isDisabled
                  ? "opacity-30 cursor-not-allowed border-neutral-800"
                  : item.isSelected
                  ? "border-[#D4AF37] scale-110"
                  : "border-neutral-700 hover:border-neutral-500"
              }`}
              style={{ backgroundColor: item.hexColor }}
            />
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            disabled={item.isDisabled}
            onClick={(e) => {
              e.preventDefault();
              if (!item.isDisabled) handleChangeVariant(item.valueId);
            }}
            className={`min-w-[2.75rem] px-3 py-2 text-sm rounded-md border transition-colors ${
              item.isDisabled
                ? "border-neutral-800 text-neutral-600 cursor-not-allowed line-through"
                : item.isSelected
                ? "border-[#D4AF37] bg-[#D4AF37]/10 text-white"
                : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
            } ${isSize ? "font-medium tracking-wide" : ""}`}
          >
            {item.name}
          </button>
        );
      })}
    </div>
  );
};

export default VariantList;
