import React, { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import useGetSetting from "@hooks/useGetSetting";

const FloatingWhatsApp = () => {
  const { storeCustomizationSetting } = useGetSetting();
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const whatsappNumber = storeCustomizationSetting?.footer?.social_whatsapp || "09240250346";

  useEffect(() => {
    // Delay showing the widget to make it feel natural
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-[99] flex items-end justify-end flex-col group">
      {/* Tooltip */}
      <div 
        className={`bg-[#0d0d0d] text-white px-4 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-neutral-800 mb-4 mr-2 transition-all duration-500 transform origin-bottom-right max-w-[200px]
          ${showTooltip ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'}`}
      >
        <div className="relative">
          <p className="text-sm font-semibold leading-snug">
            Need styling help? 👟<br/>
            <span className="text-neutral-400 font-normal text-xs">Chat with the RASA team!</span>
          </p>
          {/* Arrow pointing down right */}
          <div className="absolute -bottom-5 right-2 w-3 h-3 bg-[#0d0d0d] border-b border-r border-neutral-800 transform rotate-45"></div>
        </div>
      </div>

      {/* Button */}
      <a
        href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent("Hello, I need some help with Rasa Store.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300 hover:bg-[#128C7E] animate-bounce-slow"
        aria-label="Chat on WhatsApp"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Pulse rings */}
        <span className="absolute inline-flex w-full h-full rounded-full bg-[#25D366] opacity-30 animate-ping"></span>
        <span className="absolute inline-flex w-full h-full rounded-full bg-[#25D366] opacity-20" style={{ animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite', animationDelay: '0.5s' }}></span>
        
        <FaWhatsapp className="w-8 h-8 relative z-10" />
      </a>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 3s ease-in-out infinite;
          }
        `
      }} />
    </div>
  );
};

export default FloatingWhatsApp;
