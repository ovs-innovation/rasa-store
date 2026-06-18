import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiPlay, FiX } from "react-icons/fi";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { IoChevronBack, IoChevronForward, IoStar } from "react-icons/io5";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

import TestimonialServices from "@services/TestimonialServices";
import CMSkeleton from "@components/preloader/CMSkeleton";
import useGetSetting from "@hooks/useGetSetting";

const TestimonialsSection = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { storeCustomizationSetting } = useGetSetting();

  const {
    data: testimonials,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => await TestimonialServices.getPublicTestimonials(),
  });

  const handleVideoClick = (testimonial) => {
    setSelectedVideo(testimonial);
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setSelectedVideo(null);
  };

  const getVideoThumbnail = (videoUrl) => {
    if (!videoUrl) return null;
    const youtubeMatch = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
    }
    return null;
  };

  const isVideoUrl = (url = "") => {
    if (!url) return false;
    const lowered = url.toLowerCase();
    return lowered.includes(".mp4") || lowered.includes(".mov") || lowered.includes(".webm");
  };

  const isYoutubeUrl = (url = "") => {
    if (!url) return false;
    const lowered = url.toLowerCase();
    return lowered.includes("youtube.com") || lowered.includes("youtu.be");
  };

  const getYoutubeEmbedUrl = (url = "") => {
    if (!isYoutubeUrl(url)) return null;
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`;
    }
    return null;
  };

  const fallbackReviews = [
    {
      _id: "fb1",
      title: "GRAIL STATUS COAT",
      text: "The heavyweight wool blend on the drop-shoulder overcoat is exceptional. Perfect minimalist styling, clean stitching, and a structure that holds its shape. RASA has set a new benchmark.",
      author: "Julian R.",
      role: "Verified Collector",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
      rating: 5,
    },
    {
      _id: "fb2",
      title: "PERFECT RELAXED DROP",
      text: "Hard to find hoodies with this exact weight and slouch. The loopback cotton is thick and feels warm, yet breathes well. Minimal branding makes it super versatile for daily layering.",
      author: "Kenji T.",
      role: "Creative Director",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
      rating: 5,
    },
    {
      _id: "fb3",
      title: "PREMIUM FINISHES",
      text: "The hardware on the utility zip cargo pants feels solid, and the seams are reinforced. Delivered in under 3 days to my doorstep. RASA is easily my best pick of the season.",
      author: "Sofia M.",
      role: "Stylist",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop",
      rating: 5,
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-black py-20">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-8">
          <CMSkeleton count={3} height={20} error={error} loading={isLoading} />
        </div>
      </div>
    );
  }

  const hasTestimonials = testimonials && testimonials.length > 0;
  const displayItems = hasTestimonials ? testimonials : fallbackReviews;

  return (
    <>
      <div className="bg-black text-white lg:py-24 py-16 border-t border-neutral-900 relative overflow-hidden">
        {/* Subtle geometric grid background details */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="mx-auto max-w-screen-2xl px-4 sm:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A1A1A] text-[#D4AF37] text-[9px] font-black uppercase tracking-widest border border-neutral-800 mb-4 rounded-none">
                <span>Rasa Society</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black font-serif uppercase tracking-widest text-white leading-none">
                {storeCustomizationSetting?.home?.testimonial_title || "Verified Stories"}
              </h2>
              <p className="text-xs font-sans tracking-widest uppercase text-neutral-400 mt-3">
                {storeCustomizationSetting?.home?.testimonial_description || "REVIEWS & STYLING NOTES FROM OUR GLOBAL COMMUNITY"}
              </p>
            </div>
            
            {/* Swiper controls */}
            <div className="flex gap-3">
              <button className="prev-testimonial p-3.5 rounded-none bg-neutral-900 border border-neutral-800 text-white hover:bg-white hover:text-black transition-all duration-300">
                <IoChevronBack size={16} />
              </button>
              <button className="next-testimonial p-3.5 rounded-none bg-neutral-900 border border-neutral-800 text-white hover:bg-white hover:text-black transition-all duration-300">
                <IoChevronForward size={16} />
              </button>
            </div>
          </div>

          <div className="relative">
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              navigation={{
                prevEl: '.prev-testimonial',
                nextEl: '.next-testimonial',
              }}
              className="testimonial-swiper py-2"
            >
              {displayItems.map((item) => {
                const isRealTestimonial = hasTestimonials;
                const thumbnail = isRealTestimonial ? getVideoThumbnail(item.video) : null;
                const isYoutube = isRealTestimonial ? isYoutubeUrl(item.video) : false;
                const isDirectVideo = isRealTestimonial ? isVideoUrl(item.video) : false;

                return (
                  <SwiperSlide key={item._id}>
                    {isRealTestimonial ? (
                      /* Database Video Testimonial */
                      <div
                        className="relative rounded-none overflow-hidden border border-neutral-800 bg-neutral-950 transition-all duration-300 group cursor-pointer"
                        onClick={!isYoutube ? () => handleVideoClick(item) : undefined}
                      >
                        <div className="relative w-full aspect-[50/32] bg-neutral-900 overflow-hidden">
                          {isYoutube ? (
                            <iframe
                              src={getYoutubeEmbedUrl(item.video)?.replace('?autoplay=1', '')}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={item.title}
                            />
                          ) : isDirectVideo ? (
                            <video
                              src={item.video}
                              className="w-full h-full object-cover"
                              controls
                              playsInline
                            >
                              Your browser does not support the video tag.
                            </video>
                          ) : thumbnail ? (
                            <>
                              <Image
                                src={thumbnail}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-14 h-14 bg-white rounded-none flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
                                  <FiPlay className="text-black text-lg ml-0.5" />
                                </div>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 p-5">
                                <h3 className="text-white font-black uppercase tracking-wider text-xs">
                                  {item.title}
                                </h3>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-[300px] bg-neutral-900 flex items-center justify-center">
                              <FiPlay className="text-white text-3xl opacity-35" />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Fallback Editorial Review Card */
                      <div className="border border-neutral-900 bg-[#0A0A0A] p-8 flex flex-col justify-between h-[360px] relative group hover:border-neutral-800 transition-all duration-300">
                        {/* Quote mark decoration */}
                        <div className="absolute top-6 right-8 text-neutral-900 font-serif text-8xl leading-none select-none pointer-events-none group-hover:text-neutral-850 transition-colors duration-300">
                          “
                        </div>

                        <div>
                          {/* Rating Stars */}
                          <div className="flex gap-1 text-[#D4AF37] mb-6">
                            {[...Array(item.rating)].map((_, i) => (
                              <IoStar key={i} size={14} />
                            ))}
                          </div>

                          {/* Review Title */}
                          <h3 className="text-white font-black uppercase tracking-wider text-sm mb-4 leading-tight">
                            {item.title}
                          </h3>

                          {/* Review Text */}
                          <p className="text-neutral-400 font-sans text-xs leading-relaxed line-clamp-5">
                            "{item.text}"
                          </p>
                        </div>

                        {/* Profile Details */}
                        <div className="flex items-center gap-4 border-t border-neutral-900 pt-6 mt-4">
                          <div className="relative w-10 h-10 overflow-hidden bg-neutral-800 flex-shrink-0">
                            <img
                              src={item.avatar}
                              alt={item.author}
                              className="w-full h-full object-cover grayscale"
                            />
                          </div>
                          <div>
                            <h4 className="text-white font-black uppercase tracking-wider text-[10px]">
                              {item.author}
                            </h4>
                            <p className="text-neutral-500 font-sans text-[9px] uppercase tracking-widest mt-0.5">
                              {item.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </div>

      {/* Full Screen Video Modal */}
      {isFullscreen && selectedVideo && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
          onClick={closeFullscreen}
        >
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 z-10 text-white hover:text-neutral-400 transition-colors bg-neutral-900 border border-neutral-800 rounded-none p-3"
            aria-label="Close video"
          >
            <FiX className="text-xl" />
          </button>

          <div
            className="w-full max-w-5xl aspect-video relative rounded-none overflow-hidden border border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            {isYoutubeUrl(selectedVideo.video) ? (
              <iframe
                src={getYoutubeEmbedUrl(selectedVideo.video)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={selectedVideo.title}
              />
            ) : (
              <video
                src={selectedVideo.video}
                controls
                autoPlay
                className="w-full h-full"
                controlsList="nodownload"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TestimonialsSection;
