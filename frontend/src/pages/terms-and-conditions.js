import React from "react";
import { FiFileText, FiAlertCircle, FiCheckCircle, FiShield, FiInfo, FiLock, FiLink } from "react-icons/fi";
import Link from "next/link";

//internal import
import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import SimpleHeader from "@components/header/SimpleHeader";
import CMSkeleton from "@components/preloader/CMSkeleton";
import useUtilsFunction from "@hooks/useUtilsFunction";

const TermAndConditions = () => {
  const { showingTranslateValue } = useUtilsFunction();
  const { storeCustomizationSetting, loading, error } = useGetSetting();

  return (
    <Layout
      title="Terms & Conditions"
      description="This is terms and conditions page"
    >
      <SimpleHeader
        title={
          showingTranslateValue(storeCustomizationSetting?.term_and_condition?.title) ||
          "Terms and Conditions"
        }
      />
      <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-0">
        <div className=" ">
          
          {/* Main Policy Box */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-justify">
            
            {/* Content Section with Box Style */}
            <div className="p-6 lg:p-8">
              
              {/* CMS Content in Box */}
              <div className="terms-conditions-content">
                <style dangerouslySetInnerHTML={{
                  __html: `
                    .terms-conditions-content h1, 
                    .terms-conditions-content h2, 
                    .terms-conditions-content h3, 
                    .terms-conditions-content h4, 
                    .terms-conditions-content h5, 
                    .terms-conditions-content h6,
                    .terms-conditions-content strong {
                      font-weight: 400 !important;
                    }
                  `
                }} />
                <div className="text-gray-600 leading-relaxed">
                  <CMSkeleton
                    html
                    count={15}
                    height={15}
                    error={error}
                    loading={loading}
                    data={storeCustomizationSetting?.term_and_condition?.description || `<h2>1. Acceptance of Terms</h2>
<p>By accessing Rasa Store, you agree to these Terms and Conditions. These terms govern your use of our platform for ordering premium sneakers, streetwear, bags, and fashion accessories.</p>
<h2>2. User Eligibility</h2>
<p>You confirm that all registration and shipping information provided is accurate and truthful.</p>
<h2>3. Pricing & Availability</h2>
<p>While we strive for accuracy, product prices, stock, and availability are subject to change without prior notice. All prices include applicable taxes.</p>
<h2>4. Delivery & Cancellations</h2>
<ul>
  <li>Orders can be cancelled before they are shipped from our warehouse.</li>
  <li>Delivery times are estimates and may vary based on your location.</li>
</ul>
<h2>5. Product Authenticity</h2>
<p>Rasa Store guarantees 100% authenticity for all items curated on our platform. Each drop undergoes a multi-point verification process by our specialists before shipment.</p>`}
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

              {/* Quick Info Cards - Flex Layout */}
              {!loading && !error && (
                <div className="mt-10">
                  <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                    <FiInfo className="w-5 h-5 text-store-500" />
                    Key Information
                  </h3>
                  <div className="flex flex-col md:flex-row gap-5">
                    {/* Legal Protection Card */}
                    <div className="flex-1 bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="bg-orange-100 p-3 rounded-lg">
                          <FiShield className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1 text-base">Legal Protection</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">These terms protect both you and us, ensuring a clear understanding of our mutual rights and responsibilities.</p>
                        </div>
                      </div>
                    </div>

                    {/* Clear Guidelines Card */}
                    <div className="flex-1 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="bg-indigo-100 p-3 rounded-lg">
                          <FiFileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1 text-base">Clear Guidelines</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">Our terms provide clear guidelines on how to use our services and what to expect from us.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Links Section */}
              {!loading && !error && (
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="bg-store-100 p-2 rounded-lg">
                        <FiLink className="w-5 h-5 text-store-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 text-base">Related Information</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          For more information, please review our related policies:
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <Link 
                            href="/privacy-policy"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-store-600 hover:text-store-700 hover:border-store-300 font-medium transition-all"
                          >
                            <FiLock className="w-4 h-4" />
                            <span>Privacy Policy</span>
                          </Link>
                          <Link 
                            href="/refund-return-policy"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-store-600 hover:text-store-700 hover:border-store-300 font-medium transition-all"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                            <span>Refund & Return Policy</span>
                          </Link>
                          <Link 
                            href="/shipping-delivery-policy"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-store-600 hover:text-store-700 hover:border-store-300 font-medium transition-all"
                          >
                            <FiFileText className="w-4 h-4" />
                            <span>Shipping & Delivery Policy</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Section */}
              {!loading && !error && (
                <div className="mt-8">
                  <div className="bg-gradient-to-r from-store-50 to-green-50 rounded-xl p-6 border border-store-100">
                    <div className="flex items-start gap-4">
                      <div className="bg-store-100 p-2 rounded-lg">
                        <FiAlertCircle className="w-5 h-5 text-store-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 text-base">Questions About Our Terms?</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          If you have any questions or concerns about our terms and conditions, please contact our support team.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-store-600 bg-white/60 w-fit px-3 py-1.5 rounded-lg">
                          <FiCheckCircle className="w-4 h-4" />
                          <span>We&apos;re here to help clarify any questions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermAndConditions;
