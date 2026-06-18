import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { FiCalendar, FiClock } from "react-icons/fi";

const DashboardHeader = () => {
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 p-8 rounded-[32px] bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-2xl shadow-emerald-200 dark:shadow-none overflow-hidden relative group">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

      <div className="relative">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
          Welcome back, <span className="text-teal-200">Admin</span> 👋
        </h1>
        <p className="text-teal-100 font-medium max-w-md">
          Here's what's happening with RASA today. Check your statistics and recent orders.
        </p>
      </div>

      <div className="relative flex items-center gap-4 bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-teal-200">
            <FiCalendar className="w-3 h-3" />
            {currentTime.format("MMMM D, YYYY")}
          </div>
          <div className="flex items-center gap-2 text-2xl font-black tabular-nums tracking-tighter mt-1">
            <FiClock className="w-5 h-5 text-teal-300" />
            {currentTime.format("HH:mm:ss")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
