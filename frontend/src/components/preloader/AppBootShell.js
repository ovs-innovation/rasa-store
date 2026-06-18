import React from "react";

const AppBootShell = () => (
  <div
    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505]"
    aria-hidden="true"
  >
    <img
      src="/rasaLogo.png"
      alt=""
      width={120}
      height={48}
      className="h-10 w-auto object-contain opacity-90 animate-pulse"
    />
    <div className="mt-6 h-0.5 w-24 overflow-hidden rounded-full bg-neutral-800">
      <div className="h-full w-1/2 animate-[shimmer_1.2s_ease-in-out_infinite] rounded-full bg-[#D4AF37]" />
    </div>
    <style jsx global>{`
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(250%); }
      }
    `}</style>
  </div>
);

export default AppBootShell;
