import React from "react";
import { FiShield, FiLock, FiEye, FiFileText, FiAlertCircle, FiCheckCircle, FiUser, FiDatabase, FiGlobe, FiHeadphones } from "react-icons/fi";

//internal import
import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import SimpleHeader from "@components/header/SimpleHeader";
import CMSkeleton from "@components/preloader/CMSkeleton";
import useUtilsFunction from "@hooks/useUtilsFunction";

const PrivacyPolicy = () => {
  const { storeCustomizationSetting, loading, error } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  return (
    <Layout title="Privacy Policy" description="This is privacy policy page">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10 py-12 lg:py-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-store-600 font-semibold text-sm uppercase tracking-wider mb-3">
                {/* <FiShield className="w-4 h-4" /> */}
                {/* <span>Legal Information</span> */}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                {showingTranslateValue(storeCustomizationSetting?.privacy_policy?.title) || "Privacy Policy"}
              </h1>
              <p className="mt-4 text-gray-500 text-lg max-w-2xl">
                We value your privacy and are committed to protecting your personal data. This policy explains how we handle your information.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-20 h-20 bg-store-50 rounded-2xl flex items-center justify-center">
                <FiLock className="w-10 h-10 text-store-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 min-h-screen py-12 lg:py-16">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10">
          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Sidebar - Quick Navigation */}
            <div className="lg:w-1/3 order-2 lg:order-1">
              <div className="sticky top-24 space-y-6">
                {/* Info Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiAlertCircle className="w-5 h-5 text-store-500" />
                    Quick Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="mt-1 bg-green-100 p-1 rounded-full flex-shrink-0">
                        <FiCheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600">Your data is never sold to third parties.</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="mt-1 bg-green-100 p-1 rounded-full flex-shrink-0">
                        <FiCheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600">Secure encryption for all personal details.</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="mt-1 bg-green-100 p-1 rounded-full flex-shrink-0">
                        <FiCheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600">You have full control over your data.</p>
                    </div>
                  </div>
                </div>

                {/* Contact Support Card */}
                <div className="bg-store-600 rounded-2xl p-6 text-white shadow-lg shadow-store-200">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <FiHeadphones className="w-5 h-5" />
                    Need Help?
                  </h3>
                  <p className="text-store-100 text-sm mb-4">
                    If you have any questions about our privacy practices, our team is here to help.
                  </p>
                  <button className="w-full py-3 bg-white text-store-600 rounded-xl font-bold text-sm hover:bg-store-50 transition-colors shadow-sm">
                    Contact Privacy Team
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:w-2/3 order-1 lg:order-2">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-12">
                  <div className="privacy-policy-content prose prose-slate max-w-none">
                    <style dangerouslySetInnerHTML={{
                      __html: `
                        .privacy-policy-content h2 { 
                          font-size: 1.5rem; 
                          font-weight: 700; 
                          color: #111827; 
                          margin-top: 2rem; 
                          margin-bottom: 1rem;
                          border-bottom: 1px solid #f3f4f6;
                          padding-bottom: 0.5rem;
                        }
                        .privacy-policy-content p { 
                          color: #4b5563; 
                          line-height: 1.75; 
                          margin-bottom: 1.25rem;
                        }
                        .privacy-policy-content ul { 
                          list-style-type: disc; 
                          padding-left: 1.5rem; 
                          margin-bottom: 1.25rem;
                          color: #4b5563;
                        }
                        .privacy-policy-content li { 
                          margin-bottom: 0.5rem; 
                        }
                        .privacy-policy-content strong {
                          color: #111827;
                          font-weight: 600;
                        }
                      `
                    }} />
                    <div className="text-gray-600 leading-relaxed">
                      <CMSkeleton
                        html
                        count={20}
                        height={18}
                        error={error}
                        loading={loading}
                        data={storeCustomizationSetting?.privacy_policy?.description || `<h2>1. Introduction</h2>
<p>Welcome to Rasa Store. We are committed to protecting your privacy and ensuring the security of your personal data.</p>
<h2>2. Information We Collect</h2>
<ul>
  <li><strong>Personal Details:</strong> Name, contact number, email, and delivery address.</li>
  <li><strong>Medical Information:</strong> Prescription uploads (used strictly for order verification by licensed pharmacists).</li>
  <li><strong>Payment Data:</strong> Securely processed via trusted payment gateways (we do not store card details).</li>
</ul>
<h2>3. How We Use Your Data</h2>
<ul>
  <li>To process and deliver your medicines and groceries.</li>
  <li>To verify prescriptions in compliance with Indian pharmaceutical laws.</li>
  <li>To send order updates and promotional offers (opt-out available).</li>
</ul>
<h2>4. Data Security & Sharing</h2>
<p>Your data is encrypted and stored securely. We share necessary details (like address and phone number) only with verified delivery partners. We do not sell your data to third parties.</p>
<h2>5. Your Rights</h2>
<p>Under the DPDP Act (India), you have the right to access, correct, or request the deletion of your data. Contact our grievance officer for any privacy concerns.</p>`}
                      />
                    </div>
                  </div>

                  {loading && (
                    <div className="space-y-6">
                      <CMSkeleton count={10} height={20} loading={loading} />
                      <CMSkeleton count={10} height={20} loading={loading} />
                    </div>
                  )}
                </div>
              </div>

              {/* Trust Badges */}
              {!loading && !error && (
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: FiLock, label: "Secure SSL", color: "blue" },
                    { icon: FiShield, label: "Data Safety", color: "green" },
                    { icon: FiEye, label: "Transparency", color: "purple" },
                    { icon: FiGlobe, label: "GDPR Ready", color: "orange" }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center text-center gap-2 shadow-sm hover:shadow-md transition-shadow">
                      <item.icon className={`w-6 h-6 text-${item.color}-500`} />
                      <span className="text-xs font-bold text-gray-700">{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
