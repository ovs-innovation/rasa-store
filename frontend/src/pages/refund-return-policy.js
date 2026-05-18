import React from "react";
import { FiShield, FiLock, FiRefreshCw, FiFileText, FiAlertCircle, FiCheckCircle, FiPackage, FiHeadphones, FiShieldCheck, FiCalendar } from "react-icons/fi";

//internal import
import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import SimpleHeader from "@components/header/SimpleHeader";
import CMSkeleton from "@components/preloader/CMSkeleton";
import useUtilsFunction from "@hooks/useUtilsFunction";

const RefundReturnPolicy = () => {
  const { storeCustomizationSetting, loading, error } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  return (
    <Layout title="Refund & Return Policy" description="This is refund and return policy page">
      <SimpleHeader
        title={
          showingTranslateValue(storeCustomizationSetting?.refund_return_policy?.title) ||
          "Refund & Return Policy"
        }
      />
      
      <div className="bg-gray-50 min-h-screen px-4 sm:px-0  ">
        <div className=" ">
          
          {/* Main Policy Box */}
          <div className="bg-white rounded-2xl shadow-sm  overflow-hidden text-justify">
            
            {/* Content Section with Box Style */}
            <div className="p-6 lg:p-8">
              
              {/* CMS Content in Box */}
              <div className="refund-policy-content">
                <div className="text-gray-600 leading-relaxed">
                  <CMSkeleton
                    html
                    count={15}
                    height={15}
                    error={error}
                    loading={loading}
                    data={storeCustomizationSetting?.refund_return_policy?.description || `<h2>1. Return Eligibility</h2>
<p>Items can be returned within 7 days of delivery under the following conditions:</p>
<ul>
  <li>Products are expired or damaged upon arrival.</li>
  <li>Wrong items were delivered.</li>
  <li>Items must be unused, in original packaging, with all seals intact.</li>
</ul>
<h2>2. Non-Returnable Items</h2>
<p>Due to hygiene and safety reasons, the following cannot be returned:</p>
<ul>
  <li>Opened medicines and syrups.</li>
  <li>Personal care and hygiene products.</li>
  <li>Temperature-sensitive items (like insulin or vaccines).</li>
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
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Card 1 - Easy Returns */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiPackage className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Easy Returns</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Return products within the specified time frame with our hassle-free return process.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2 - Quick Refunds */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiRefreshCw className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Quick Refunds</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Get your money back quickly once we receive and verify your returned items.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3 - Return Window */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiCalendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Return Window</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Most products can be returned within 7-15 days of delivery. Check product page for specific details.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4 - Quality Assurance */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiShield className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Quality Assurance</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      We ensure all returned products are inspected thoroughly before processing refunds.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Contact Section - Box Style */}
          {!loading && !error && (
            <div className="mt-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                    <FiHeadphones className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help with Returns?</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      If you have any questions about our refund and return policy, please contact our customer support team.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-blue-700 bg-white px-4 py-2 rounded-lg shadow-sm">
                        <FiShield className="w-4 h-4" />
                        <span className="font-medium">100% Secure Process</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-700 bg-white px-4 py-2 rounded-lg shadow-sm">
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
    </Layout>
  );
};

export default RefundReturnPolicy;

