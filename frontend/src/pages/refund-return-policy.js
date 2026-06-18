import React from "react";
import { FiShield, FiLock, FiRefreshCw, FiFileText, FiAlertCircle, FiCheckCircle, FiPackage, FiHeadphones, FiShieldCheck, FiCalendar } from "react-icons/fi";

//internal import
import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import CMSkeleton from "@components/preloader/CMSkeleton";
import useUtilsFunction from "@hooks/useUtilsFunction";

const RefundReturnPolicy = () => {
  const { storeCustomizationSetting, loading, error } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  return (
    <Layout title="Refund & Return Policy" description="This is refund and return policy page">
      {/* Premium Header */}
      <div className="bg-[#050505] py-16 lg:py-24 border-b border-neutral-900">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-black text-white mb-6 uppercase tracking-tight flex items-center justify-center gap-3">
            <span className="w-1.5 h-12 bg-[#D4AF37] rounded-full inline-block" />
            {showingTranslateValue(storeCustomizationSetting?.refund_return_policy?.title) || "Refund & Return Policy"}
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto">
            Review our terms for returns, exchanges, and order cancellations.
          </p>
        </div>
      </div>
      
      <div className="bg-black min-h-screen px-4 sm:px-10 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto">
          
          {/* Main Policy Box */}
          <div className="bg-[#050505] rounded-3xl border border-neutral-900 overflow-hidden text-justify shadow-2xl">
            
            {/* Content Section with Box Style */}
            <div className="p-6 md:p-10 lg:p-12">
              
              {/* CMS Content in Box */}
              <div className="refund-policy-content">
                <div className="text-neutral-300 leading-relaxed font-sans">
                  <CMSkeleton
                    html
                    count={15}
                    height={15}
                    error={error}
                    loading={loading}
                    data={storeCustomizationSetting?.refund_return_policy?.description || `<h2>1. Return Eligibility</h2>
<p>Items can be returned within 7 days of delivery under the following conditions:</p>
<ul>
  <li>Products are damaged upon arrival.</li>
  <li>Wrong items or sizes were delivered.</li>
  <li>Items must be unused, in original packaging, with all security tags and brand packaging intact.</li>
</ul>
<h2>2. Non-Returnable Items</h2>
<p>Due to authenticity and safety reasons, the following cannot be returned:</p>
<ul>
  <li>Items with removed authentication tags or security seals.</li>
  <li>Items showing signs of outdoor wear, usage, or scuffing (especially sneaker outsoles).</li>
  <li>Limited edition collaborative drops that explicitly state no returns.</li>
</ul>
<h2>3. Refund Process</h2>
<p>Once your return is received and inspected, refunds will be processed to your original payment method within 5-7 business days.</p>
<h2>4. Cancellations</h2>
<p>You may cancel your order at no cost before it has been dispatched. Dispatched orders cannot be cancelled.</p>`}
                  />
                </div>
              </div>

              {/* Loading States */}
              {loading && (
                <div className="mt-6 space-y-4">
                  <CMSkeleton count={15} height={15} loading={loading} />
                  <CMSkeleton count={15} height={15} loading={loading} />
                </div>
              )}
            </div>
          </div>

          {/* Info Cards Grid - 2x2 Layout */}
          {!loading && !error && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
              
              {/* Card 1 - Easy Returns */}
              <div className="bg-[#0A0A0A] border border-neutral-900 rounded-xl p-5 hover:border-neutral-800 transition-all shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-neutral-950 border border-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiPackage className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold uppercase tracking-wider text-white mb-2">Easy Returns</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      Return products within the specified time frame with our hassle-free return process.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2 - Quick Refunds */}
              <div className="bg-[#0A0A0A] border border-neutral-900 rounded-xl p-5 hover:border-neutral-800 transition-all shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-neutral-950 border border-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiRefreshCw className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold uppercase tracking-wider text-white mb-2">Quick Refunds</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      Get your money back quickly once we receive and verify your returned items.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3 - Return Window */}
              <div className="bg-[#0A0A0A] border border-neutral-900 rounded-xl p-5 hover:border-neutral-800 transition-all shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-neutral-950 border border-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiCalendar className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold uppercase tracking-wider text-white mb-2">Return Window</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      Most products can be returned within 7-15 days of delivery. Check product page for specific details.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4 - Quality Assurance */}
              <div className="bg-[#0A0A0A] border border-neutral-900 rounded-xl p-5 hover:border-neutral-800 transition-all shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-neutral-950 border border-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiShield className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold uppercase tracking-wider text-white mb-2">Quality Assurance</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      We ensure all returned products are inspected thoroughly before processing refunds.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Contact Section - Box Style */}
          {!loading && !error && (
            <div className="mt-8 font-sans">
              <div className="bg-gradient-to-r from-neutral-950 to-neutral-900 rounded-xl border border-neutral-850 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-neutral-950 border border-neutral-900 rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                    <FiHeadphones className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-serif font-bold uppercase tracking-wider text-white mb-2">Need Help with Returns?</h3>
                    <p className="text-sm text-neutral-400 mb-4">
                      If you have any questions about our refund and return policy, please contact our customer support team.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-[#D4AF37] bg-black border border-neutral-900 px-4 py-2 rounded-lg">
                        <FiShield className="w-4 h-4" />
                        <span className="font-medium">100% Secure Process</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#D4AF37] bg-black border border-neutral-900 px-4 py-2 rounded-lg">
                        <FiCheckCircle className="w-4 h-4" />
                        <span className="font-medium">Hassle-Free Returns</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <style jsx global>{`
        .refund-policy-content h2 {
          color: #ffffff;
          font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
          font-size: 1.5rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 2rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid #1a1a1a;
          padding-bottom: 0.5rem;
        }
        .refund-policy-content h2:first-of-type {
          margin-top: 0;
        }
        .refund-policy-content p {
          margin-bottom: 1rem;
          font-size: 1rem;
          line-height: 1.75;
          color: #d4d4d4;
        }
        .refund-policy-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
          color: #a3a3a3;
        }
        .refund-policy-content li {
          margin-bottom: 0.5rem;
          line-height: 1.625;
        }
      `}</style>
    </Layout>
  );
};

export default RefundReturnPolicy;
