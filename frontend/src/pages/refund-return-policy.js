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
                    data={storeCustomizationSetting?.refund_return_policy?.description || `<h2>Return &amp; Exchange Policy</h2>
<p><strong>No Return. No Exchange.</strong></p>
<p>Unless the supplier is at fault (wrong item, damaged product, or defective item received).</p>
<p>If there is a supplier fault, contact us on WhatsApp at <strong>9731308713</strong> within 48 hours of delivery with photos.</p>`}
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

          {/* Info cards removed — policy text above is the source of truth */}

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
                      WhatsApp us at <a href="https://wa.me/919731308713" className="text-[#D4AF37] hover:underline">9731308713</a> for any questions.
                    </p>
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
