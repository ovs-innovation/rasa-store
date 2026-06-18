import React from "react";

const Loading = ({ loading, fullScreen = false }) => {
  if (!loading) return null;

  const shell = (
    <div
      className={`flex flex-col items-center justify-center bg-[#050505] ${
        fullScreen ? "fixed inset-0 z-[9998]" : "min-h-[40vh] w-full py-16"
      }`}
    >
      <img
        src="/rasaLogo.png"
        alt=""
        width={100}
        height={40}
        className="h-9 w-auto object-contain opacity-80 animate-pulse"
      />
      <div className="mt-4 h-0.5 w-16 overflow-hidden rounded-full bg-neutral-800">
        <div className="h-full w-1/2 animate-[loadbar_1s_ease-in-out_infinite] rounded-full bg-[#D4AF37]" />
      </div>
    </div>
  );

  return (
    <>
      {shell}
      <style jsx global>{`
        @keyframes loadbar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </>
  );
};

export default Loading;
