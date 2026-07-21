import React from "react";
import Link from "next/link";
import { FiShield, FiTrendingUp, FiTruck, FiArrowRight, FiUsers, FiPackage, FiAward } from "react-icons/fi";

//internal import
import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";

const AboutUs = () => {
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  return (
    <Layout title="About Us" description="More than fashion. It's a culture - Rasa Streetwear">
      
      {/* 1. HERO SECTION: Light Grey Background */}
      <div className="bg-[#F3F3F3] text-black pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            
            {/* Left Column: Copy */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <span className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.25em] block font-sans">
                ABOUT RASA
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-black uppercase tracking-tight leading-[1.05] text-black">
                WE’RE JUST HERE<br />
                TO MAKE YOUR WISHLIST<br />
                A REALITY.
              </h1>
              <p className="text-neutral-700 text-base md:text-lg font-sans leading-relaxed">
                At The Rasa Store, you’ll find the bags and sneakers everyone’s searching for, saving, and adding to their mood boards. From everyday staples to standout picks, we bring together styles that help you level up your collection without the endless hunt.
              </p>
              <p className="text-neutral-500 text-sm font-sans tracking-wide">
                With 5,000+ happy customers across India, we’re all about helping you build a collection you’ll keep reaching for—one great find at a time.
              </p>
              <div className="pt-2">
                <a 
                  href="#story"
                  className="bg-black text-white hover:bg-neutral-800 transition-all font-sans font-black tracking-widest text-xs uppercase px-8 py-4 rounded-full inline-flex items-center gap-3 group shadow-md"
                >
                  OUR STORY 
                  <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Right Column: Hero Mockup Image */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full relative overflow-hidden rounded-2xl">
                <img 
                  src="/about_hero_mockup.png" 
                  alt="RASA Streetwear Collection"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. OUR STORY SECTION: Deep Black Background */}
      <div id="story" className="bg-black text-white py-20 lg:py-28 border-t border-neutral-900">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Side Copy */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <span className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.25em] block font-sans">
                OUR STORY
              </span>
              <h2 className="text-3xl md:text-4xl font-sans font-black uppercase tracking-tight leading-tight text-white">
                OUR ORIGIN STORY<br />
                AND THE EVOLUTION OF RASA
              </h2>
              <div className="space-y-4 text-neutral-400 font-sans text-sm md:text-base leading-relaxed text-justify">
                <p>
                  What started as a passion project for premium sneakers has now grown into RASA.
                </p>
                <p>
                  Today, we offer a carefully curated collection of sneakers, bags, slides and accessories from top brands around the world.
                </p>
                <p>
                  Our mission is simple - deliver authentic products, latest trends and the best shopping experience for everyone who lives streetwear and lifestyle fashion.
                </p>
              </div>
            </div>

            {/* Right Side Lookbook Column Cards */}
            <div className="lg:col-span-7 grid grid-cols-3 gap-3 md:gap-4">
              <div className="rounded-xl overflow-hidden aspect-[3/5] relative bg-neutral-950 border border-neutral-900">
                <img 
                  src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=400&h=660&q=80" 
                  alt="Streetwear Walk" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <div className="rounded-xl overflow-hidden aspect-[3/5] relative bg-neutral-950 border border-neutral-900 mt-6 lg:mt-8">
                <img 
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&h=660&q=80" 
                  alt="Streetwear Backpack Detail" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <div className="rounded-xl overflow-hidden aspect-[3/5] relative bg-neutral-950 border border-neutral-900">
                <img 
                  src="https://images.unsplash.com/photo-1605733513597-a8f8341084e6?auto=format&fit=crop&w=400&h=660&q=80" 
                  alt="Streetwear Tote Look" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. WHAT WE OFFER: Off-White Background */}
      <div className="bg-[#F8F8F8] text-black py-20 lg:py-24">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div className="text-left space-y-2">
              <span className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.25em] block font-sans">
                WHAT WE OFFER
              </span>
              <h2 className="text-3xl lg:text-4xl font-sans font-black uppercase tracking-tight text-black">
                EVERYTHING YOU NEED,<br />
                ALL IN ONE PLACE.
              </h2>
            </div>
            {/* Arrows UI */}
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <button className="w-10 h-10 rounded-full border border-neutral-250 flex items-center justify-center text-neutral-400 hover:text-black hover:border-black transition-all">
                &larr;
              </button>
              <button className="w-10 h-10 rounded-full border border-neutral-250 flex items-center justify-center text-neutral-400 hover:text-black hover:border-black transition-all">
                &rarr;
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 font-sans max-w-4xl mx-auto">
            
            {/* Sneakers Card */}
            <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200/60 shadow-sm hover:shadow-md transition-all group text-left">
              <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100 border-b border-neutral-100">
                <img 
                  src="https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=600&h=450&q=80" 
                  alt="Sneakers Category" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-wider text-black">SNEAKERS</span>
                  </div>
                  <p className="text-neutral-500 text-xs leading-relaxed">Top brands. Latest drops. Unmatched style.</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                  &rarr;
                </div>
              </div>
            </div>

            {/* Bags Card */}
            <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200/60 shadow-sm hover:shadow-md transition-all group text-left">
              <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100 border-b border-neutral-100">
                <img 
                  src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&h=450&q=80" 
                  alt="Bags Category" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-wider text-black">BAGS</span>
                  </div>
                  <p className="text-neutral-500 text-xs leading-relaxed">Backpacks, sling bags, totes & more.</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                  &rarr;
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 4. WHY SHOP WITH US: Black Banner */}
      <div className="bg-black text-white py-14 border-t border-b border-neutral-900">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 font-sans">
            
            {/* Feature 1 */}
            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center flex-shrink-0 text-[#D4AF37]">
                <FiShield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-white">AUTHENTIC PRODUCTS</h4>
                <p className="text-xs text-neutral-450 leading-relaxed mt-1">100% genuine products from trusted brands.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center flex-shrink-0 text-[#D4AF37]">
                <FiTrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-white">TREND-DRIVEN</h4>
                <p className="text-xs text-neutral-450 leading-relaxed mt-1">Handpicked styles that keep you ahead.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center flex-shrink-0 text-[#D4AF37]">
                <FiTruck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-white">FAST SHIPPING</h4>
                <p className="text-xs text-neutral-450 leading-relaxed mt-1">Quick delivery across India.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 5. RASA LIFESTYLE: Light Grey Lifestyle Grid */}
      <div className="bg-[#F8F8F8] py-16">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10 text-left">
          <span className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.25em] block mb-6 font-sans">
            RASA LIFESTYLE
          </span>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="rounded-xl overflow-hidden aspect-square bg-neutral-200">
              <img src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=300&h=300&q=80" alt="Dunks Detail" className="w-full h-full object-cover hover:scale-105 transition-all duration-300" />
            </div>
            <div className="rounded-xl overflow-hidden aspect-square bg-neutral-200">
              <img src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&h=300&q=80" alt="Backpack Detail" className="w-full h-full object-cover hover:scale-105 transition-all duration-300" />
            </div>
            <div className="rounded-xl overflow-hidden aspect-square bg-neutral-200">
              <img src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=300&h=300&q=80" alt="Premium Sneaker Detail" className="w-full h-full object-cover hover:scale-105 transition-all duration-300" />
            </div>
            <div className="rounded-xl overflow-hidden aspect-square bg-neutral-200">
              <img src="https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=300&h=300&q=80" alt="Backpack Wearer" className="w-full h-full object-cover hover:scale-105 transition-all duration-300" />
            </div>
            <div className="rounded-xl overflow-hidden aspect-square bg-neutral-200">
              <img src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&h=300&q=80" alt="Sneakers Profile" className="w-full h-full object-cover hover:scale-105 transition-all duration-300" />
            </div>
            <div className="rounded-xl overflow-hidden aspect-square bg-neutral-200">
              <img src="https://images.unsplash.com/photo-1605733513597-a8f8341084e6?auto=format&fit=crop&w=300&h=300&q=80" alt="Tote Bag Walk" className="w-full h-full object-cover hover:scale-105 transition-all duration-300" />
            </div>
          </div>
        </div>
      </div>

      {/* 6. BOTTOM STATISTICS BAR & CALL-TO-ACTIONS */}
      <div className="bg-[#F8F8F8] pb-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10">
          <div className="bg-black text-white rounded-3xl p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl font-sans">
            
            {/* Stats Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16 w-full lg:w-auto text-left lg:border-r lg:border-neutral-800 pr-0 lg:pr-12">
              
              {/* Stat 1 */}
              <div className="flex items-center gap-4">
                <div className="text-3xl text-[#D4AF37]"><FiUsers /></div>
                <div>
                  <div className="text-2xl font-black text-white leading-tight">5,000+</div>
                  <div className="text-xs text-neutral-450 uppercase tracking-wider">Happy Customers</div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-4">
                <div className="text-3xl text-[#D4AF37]"><FiPackage /></div>
                <div>
                  <div className="text-2xl font-black text-white leading-tight">10,000+</div>
                  <div className="text-xs text-neutral-450 uppercase tracking-wider">Orders Delivered</div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-4">
                <div className="text-3xl text-[#D4AF37]"><FiAward /></div>
                <div>
                  <div className="text-2xl font-black text-white leading-tight">200+</div>
                  <div className="text-xs text-neutral-450 uppercase tracking-wider">Top Brands</div>
                </div>
              </div>

            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto sm:justify-end">
              <Link 
                href="/search?category=sneakers"
                className="border border-neutral-800 text-white hover:bg-neutral-900 transition-all font-black text-xs uppercase tracking-widest px-8 py-4 rounded-xl flex items-center justify-center gap-2"
              >
                SHOP SNEAKERS
                <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/search?category=bags"
                className="bg-white text-black hover:bg-neutral-200 transition-all font-black text-xs uppercase tracking-widest px-8 py-4 rounded-xl flex items-center justify-center gap-2"
              >
                SHOP BAGS
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Business Details — required for payment gateway verification */}
      <div className="bg-[#0A0A0A] text-white py-16 border-t border-neutral-900">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10 text-center">
          <span className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.25em] block mb-4">
            Legal Information
          </span>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-6">
            Registered Business Details
          </h2>
          <div className="max-w-lg mx-auto text-sm text-neutral-400 leading-7 space-y-1">
            <p><strong className="text-white">Rachana Dharmesh Kelawala</strong></p>
            <p>Bangalore, Karnataka, India — 570037</p>
            <p>
              <a href="mailto:workwithrasa@gmail.com" className="text-[#D4AF37] hover:underline">
                workwithrasa@gmail.com
              </a>
              {" · "}
              <a href="https://wa.me/919731308713" className="text-[#D4AF37] hover:underline">
                +91 9731308713
              </a>
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-8 text-[10px] uppercase tracking-wider font-bold">
            <Link href="/privacy-policy" className="text-neutral-500 hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-neutral-700">·</span>
            <Link href="/terms-and-conditions" className="text-neutral-500 hover:text-white transition-colors">Terms & Conditions</Link>
            <span className="text-neutral-700">·</span>
            <Link href="/return-refund-policy" className="text-neutral-500 hover:text-white transition-colors">Return & Exchange</Link>
            <span className="text-neutral-700">·</span>
            <Link href="/shipping-delivery-policy" className="text-neutral-500 hover:text-white transition-colors">Shipping Policy</Link>
          </div>
        </div>
      </div>

    </Layout>
  );
};

export default AboutUs;
