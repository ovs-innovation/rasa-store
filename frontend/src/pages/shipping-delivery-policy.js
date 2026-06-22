import React from "react";
import { FiTruck, FiClock, FiMapPin, FiPackage, FiAlertCircle, FiCheckCircle, FiGlobe, FiShield, FiInfo } from "react-icons/fi";

//internal import
import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import SimpleHeader from "@components/header/SimpleHeader";
import CMSkeleton from "@components/preloader/CMSkeleton";
import useUtilsFunction from "@hooks/useUtilsFunction";

const ShippingDeliveryPolicy = () => {
  const { storeCustomizationSetting, loading, error } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  return (
    <Layout title="Shipping & Delivery Policy" description="This is shipping and delivery policy page">
      <SimpleHeader
        title={
          showingTranslateValue(storeCustomizationSetting?.shipping_delivery_policy?.title) ||
          "Shipping & Delivery Policy"
        }
      />
      
      <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-0">
        <div className="">
          
          {/* Main Policy Box */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-justify">
            
            {/* Content Section with Box Style */}
            <div className="p-6 lg:p-8">
              
              {/* CMS Content in Box */}
              <div className="shipping-policy-content">
                <div className="text-gray-600 leading-relaxed">
                  <CMSkeleton
                    html
                    count={15}
                    height={15}
                    error={error}
                    loading={loading}
                    data={storeCustomizationSetting?.shipping_delivery_policy?.description || `<h2>1. Delivery Areas</h2>
<p>We currently deliver across all major cities and states throughout India.</p>
<h2>2. Delivery Charges</h2>
<ul>
  <li>Free shipping on all orders.</li>
</ul>
<h2>3. Estimated Delivery Time</h2>
<ul>
  <li><strong>Metro Cities:</strong> 2-4 business days.</li>
  <li><strong>Other Regions:</strong> 3-7 business days.</li>
</ul>
<h2>4. Order Tracking</h2>
<p>Once your order is shipped, you will receive a tracking link via SMS/WhatsApp and email.</p>`}
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
              
              {/* Card 1 - Shipping Coverage */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiGlobe className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Shipping Coverage</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Rasa Store delivers high-heat drops and streetwear secure packaging across India.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2 - Delivery Timelines */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiClock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Delivery Timelines</h3>
                    <div className="text-sm text-gray-600 leading-relaxed space-y-1">
                      <p><strong>Metro cities:</strong> 1-4 business days</p>
                      <p><strong>Non-metro locations:</strong> 3-7 business days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 - Shipping Charges */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiPackage className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Shipping Charges</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Shipping charges, if applicable, will be clearly displayed at checkout.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4 - Delivery Attempts */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiTruck className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Delivery Attempts</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      If delivery fails due to incorrect address or customer unavailability, re-delivery may be attempted or order may be cancelled.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Contact Section - Box Style */}
          {!loading && !error && (
            <div className="mt-8">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                    <FiInfo className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help with Shipping?</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      If you have any questions about our shipping and delivery policy, please contact our customer support team.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-emerald-700 bg-white px-4 py-2 rounded-lg shadow-sm">
                        <FiShield className="w-4 h-4" />
                        <span className="font-medium">Safe & Secure Delivery</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-emerald-700 bg-white px-4 py-2 rounded-lg shadow-sm">
                        <FiCheckCircle className="w-4 h-4" />
                        <span className="font-medium">100% Authentic Products</span>
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

export default ShippingDeliveryPolicy;

