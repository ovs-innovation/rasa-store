import React from "react";
import { IoShieldCheckmarkOutline, IoCardOutline, IoRocketOutline, IoHeadsetOutline } from "react-icons/io5";

const TrustBadges = () => {
  const items = [
    {
      id: 1,
      icon: <IoShieldCheckmarkOutline className="text-3xl text-[#D4AF37]" />,
      title: "100% Quality Checked",
      desc: "Every sneaker authenticated before shipment"
    },
    {
      id: 2,
      icon: <IoCardOutline className="text-3xl text-[#D4AF37]" />,
      title: "Secure Payments",
      desc: "SSL encrypted transaction environment"
    },
    {
      id: 3,
      icon: <IoRocketOutline className="text-3xl text-[#D4AF37]" />,
      title: "Fast Delivery",
      desc: "Quick shipping across India"
    },
    {
      id: 4,
      icon: <IoHeadsetOutline className="text-3xl text-[#D4AF37]" />,
      title: "Customer Support",
      desc: "Fast assistance via Instagram and WhatsApp"
    }
  ];

  return (
    <div className="bg-[#0A0A0A] border-y border-neutral-900 py-12 md:py-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col items-center text-center space-y-3 p-5 bg-[#111111] rounded-xl border border-neutral-800 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:border-[#D4AF37]/40 transition-colors duration-300">
              <div className="p-3 bg-[#1a1a1a] border border-neutral-800 rounded-full">
                {item.icon}
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                {item.title}
              </h3>
              <p className="text-xs text-neutral-500 font-semibold max-w-[200px]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;
