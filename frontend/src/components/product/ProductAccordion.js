import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const ProductAccordion = ({ sections = [], defaultOpen }) => {
  const [openId, setOpenId] = useState(defaultOpen || sections[0]?.id || null);

  if (!sections.length) return null;

  return (
    <div className="border-t border-neutral-800">
      {sections.map((section) => {
        const isOpen = openId === section.id;
        return (
          <div key={section.id} className="border-b border-neutral-800">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : section.id)}
              className="w-full flex items-center justify-between py-4 text-left group"
            >
              <span className="text-sm font-medium text-white tracking-wide group-hover:text-[#D4AF37] transition-colors">
                {section.title}
              </span>
              <FiChevronDown
                className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-[#D4AF37]" : ""
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? "max-h-[2000px] opacity-100 pb-5" : "max-h-0 opacity-0"
              }`}
            >
              <div className="text-sm text-neutral-400 leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductAccordion;
