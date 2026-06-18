import React, { useState } from "react";
import { FaInstagram, FaHeart, FaRegHeart, FaRegComment, FaRegBookmark, FaBookmark } from "react-icons/fa";
import { FiSend, FiMoreHorizontal } from "react-icons/fi";

const INSTAGRAM_HANDLE = "kicksbyrasaa";
const PROFILE_PICTURE = "/rasaLogo.png";

const InstagramFeed = ({ posts = [] }) => {
  const [likedPosts, setLikedPosts] = useState({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState({});

  const displayPosts = (posts || [])
    .filter((post) => post?.image)
    .map((post, idx) => ({
      id: post.id || `ig-${idx}`,
      image: post.image,
      link: post.url || post.link || `https://www.instagram.com/${INSTAGRAM_HANDLE}`,
      likes: post.likes || "",
      location: post.location || "",
      caption: post.caption || "",
      timeAgo: post.timeAgo || "",
    }));

  if (!displayPosts.length) return null;

  const toggleLike = (id) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleBookmark = (id) => {
    setBookmarkedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-[#050505] py-28 border-t border-neutral-900 relative overflow-hidden">
      {/* Background Soft Glows for Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[35vw] h-[35vw] rounded-full blur-[130px] bg-[#D4AF37]/5" />
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full blur-[150px] bg-neutral-900/40" />
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        
        {/* Section Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
              <FaInstagram className="text-xs text-[#D4AF37]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">
                @{INSTAGRAM_HANDLE}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-none">
              From Instagram
            </h2>
            <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider">
              Explore featured drops and daily inspiration straight from our feed
            </p>
          </div>

          <div className="mt-6 md:mt-0">
            <a
              href={`https://www.instagram.com/${INSTAGRAM_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-extrabold text-[10px] uppercase tracking-widest rounded-md hover:bg-[#D4AF37] hover:text-black transition-all duration-300 shadow-md hover:scale-105 active:scale-95 pointer-events-auto"
            >
              <span>Follow Us</span>
            </a>
          </div>
        </div>

        {/* Instagram Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-5xl mx-auto">
          {displayPosts.map((post) => {
            const isLiked = !!likedPosts[post.id];
            const isBookmarked = !!bookmarkedPosts[post.id];

            return (
              <div
                key={post.id}
                className="bg-[#080808] border border-neutral-900/70 hover:border-[#D4AF37]/30 rounded-2xl overflow-hidden flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:shadow-[0_20px_50px_rgba(212,175,55,0.08)] transition-all duration-500 hover:-translate-y-2 group"
              >
                {/* 1. POST HEADER */}
                <div className="flex items-center justify-between p-4 border-b border-white/[0.03] bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    {/* Profile Avatar */}
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-neutral-800 bg-neutral-900 shrink-0 p-[1.5px] bg-gradient-to-tr from-[#D4AF37]/40 to-neutral-700">
                      <img
                        src={PROFILE_PICTURE}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=150";
                        }}
                      />
                    </div>
                    
                    {/* Username, Location & Badge */}
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-1">
                        <a
                          href={post.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-black text-white hover:underline tracking-tight"
                        >
                          {INSTAGRAM_HANDLE}
                        </a>
                        {/* Verified Badge */}
                        <svg
                          className="w-3.5 h-3.5 text-[#3897f0] fill-current"
                          viewBox="0 0 24 24"
                          aria-label="Verified"
                        >
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </div>
                      <span className="text-[9px] font-bold text-neutral-500 tracking-wide">
                        {post.location}
                      </span>
                    </div>
                  </div>

                  <button className="text-neutral-500 hover:text-white transition-colors duration-300">
                    <FiMoreHorizontal className="text-lg" />
                  </button>
                </div>

                {/* 2. POST IMAGE */}
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square block bg-black overflow-hidden"
                >
                  <img
                    src={post.image}
                    alt={`Instagram Post by ${INSTAGRAM_HANDLE}`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Glass sheen effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent z-[1]" />
                </a>

                {/* 3. POST INTERACTIONS (Action Bar) */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-lg">
                      {/* Like button */}
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`transition-all duration-300 hover:scale-120 ${
                          isLiked ? "text-red-500" : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        {isLiked ? <FaHeart /> : <FaRegHeart />}
                      </button>
                      
                      {/* Comment button */}
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-400 hover:text-white transition-all duration-300 hover:scale-120"
                      >
                        <FaRegComment />
                      </a>
                      
                      {/* Share button */}
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-400 hover:text-white transition-all duration-300 hover:scale-120"
                      >
                        <FiSend />
                      </a>
                    </div>

                    {/* Bookmark button */}
                    <button
                      onClick={() => toggleBookmark(post.id)}
                      className={`transition-all duration-300 hover:scale-120 text-lg ${
                        isBookmarked ? "text-[#D4AF37]" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
                  </div>

                  {/* Likes count */}
                  <div className="text-xs font-black text-white text-left tracking-wide">
                    {post.likes} likes
                  </div>

                  {/* Caption */}
                  <div className="text-xs text-neutral-300 leading-relaxed font-sans text-left">
                    <span className="font-black text-white mr-2">{INSTAGRAM_HANDLE}</span>
                    {post.caption}
                  </div>

                  {/* Timestamp */}
                  <div className="text-[9px] font-bold text-neutral-600 tracking-wider text-left uppercase">
                    {post.timeAgo}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InstagramFeed;
