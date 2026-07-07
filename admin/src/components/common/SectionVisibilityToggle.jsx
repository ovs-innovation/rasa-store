import SwitchToggle from "@/components/form/switch/SwitchToggle";

const SectionVisibilityToggle = ({ enabled, onChange, label = "Show on site" }) => (
  <div className="flex items-center gap-2 shrink-0">
    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 hidden sm:inline">
      {label}
    </span>
    <SwitchToggle processOption={enabled !== false} handleProcess={onChange} />
  </div>
);

export default SectionVisibilityToggle;
