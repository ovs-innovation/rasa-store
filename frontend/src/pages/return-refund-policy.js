import React from "react";
import { FiRefreshCw, FiPackage, FiAlertCircle, FiCheckCircle, FiShield } from "react-icons/fi";

import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import SimpleHeader from "@components/header/SimpleHeader";
import CMSkeleton from "@components/preloader/CMSkeleton";
import useUtilsFunction from "@hooks/useUtilsFunction";

const ReturnRefundPolicy = () => {
  const { storeCustomizationSetting, loading, error } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  return (
    <Layout
      title="Return & Exchange Policy"
      description="Return, refund and exchange policy for RASA Store"
    >
      <SimpleHeader
        title={
          showingTranslateValue(storeCustomizationSetting?.refund_return_policy?.title) ||
          "Return & Exchange Policy"
        }
      />

      <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-0">
        <div className="">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-justify">
            <div className="p-6 lg:p-8">
              <div className="return-policy-content">
                <div className="text-gray-600 leading-relaxed">
                  <CMSkeleton
                    html
                    count={15}
                    height={15}
                    error={error}
                    loading={loading}
                    data={
                      storeCustomizationSetting?.refund_return_policy?.description ||
                      `<h2>1. Order Cancellation</h2>
<p>You may cancel your order within <strong>24 hours of placement</strong> or before it is shipped, whichever is earlier. Contact us on WhatsApp at +91 9731308713 or email workwithrasa@gmail.com with your Order ID.</p>
<h2>2. Refund Policy</h2>
<p>Approved refunds are processed within <strong>5–7 business days</strong> to the original payment method.</p>
<h2>3. Return & Exchange Policy</h2>
<p>We do not offer returns, refunds, or exchanges for change of mind, sizing preferences, or personal taste.</p>
<p>Exchanges will only be considered if:</p>
<ul>
  <li>You receive the wrong item</li>
  <li>The item is damaged on delivery</li>
  <li>The sizing delivered is incorrect</li>
</ul>
<p>If this is the case, an unboxing video is mandatory.</p>
<p><strong>Important Unboxing Instructions</strong></p>
<p>A clear, continuous unboxing video is mandatory for all claims. The video must show the sealed package being opened from start to finish in a single recording.</p>
<ul>
  <li>Claims must be reported within 3 days of delivery</li>
  <li>Requests without a valid unboxing video will not be accepted</li>
  <li>Edited, cut, or pre-opened package videos will be rejected</li>
</ul>
<p>If a claim is approved, the product will be exchanged only for the same model. All claims are subject to verification and approval by our team.</p>
<h2>Contact Us</h2>
<p><strong>Business Name:</strong> Rachana Dharmesh Kelawala<br/>
<strong>Address:</strong> Bangalore, Karnataka, India - 570037<br/>
<strong>Email:</strong> workwithrasa@gmail.com<br/>
<strong>Phone:</strong> +91 9731308713</p>`
                    }
                  />
                </div>
              </div>

              {loading && (
                <div className="mt-6 space-y-4">
                  <CMSkeleton count={15} height={15} loading={loading} />
                </div>
              )}
            </div>
          </div>

          {!loading && !error && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiRefreshCw className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Exchange Eligibility</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Exchanges are available for wrong items, damaged products, or incorrect sizing only.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiPackage className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Unboxing Video Required</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      A continuous unboxing video from sealed package to opened product is mandatory for all claims.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiAlertCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2">3-Day Reporting Window</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      All exchange or damage claims must be reported within 3 days of delivery.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiShield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Verification Process</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      All claims are reviewed and approved by our team before any exchange is processed.
                    </p>
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

export default ReturnRefundPolicy;
