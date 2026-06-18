import React from "react";
import { FiBriefcase, FiMail, FiUser, FiTrendingUp, FiShoppingBag, FiMessageSquare, FiTruck, FiBarChart2, FiUsers } from "react-icons/fi";

//internal import
import Layout from "@layout/Layout";
import SimpleHeader from "@components/header/SimpleHeader";
import useGetSetting from "@hooks/useGetSetting";

const Careers = () => {
  const { storeCustomizationSetting } = useGetSetting();

  const opportunities = [
    {
      title: "Licensed Pharmacists",
      icon: FiShoppingBag,
      description: "Join our team of healthcare professionals and make a difference in patient care.",
      color: "bg-blue-50 border-blue-500",
      iconColor: "text-blue-500",
    },
    {
      title: "Customer Support Executives",
      icon: FiMessageSquare,
      description: "Help customers with their queries and provide excellent service experience.",
      color: "bg-green-50",
      borderColor: "#006E44",
      iconColor: "#006E44",
    },
    {
      title: "Operations & Supply Chain",
      icon: FiTruck,
      description: "Manage our logistics and ensure smooth operations across the supply chain.",
      color: "bg-purple-50 border-purple-500",
      iconColor: "text-purple-500",
    },
    {
      title: "Digital Marketing",
      icon: FiTrendingUp,
      description: "Drive our digital presence and connect with customers through innovative campaigns.",
      color: "bg-orange-50 border-orange-500",
      iconColor: "text-orange-500",
    },
    {
      title: "Business Development",
      icon: FiBarChart2,
      description: "Expand our reach and build strategic partnerships for business growth.",
      color: "bg-pink-50 border-pink-500",
      iconColor: "text-pink-500",
    },
  ];

  return (
    <Layout title="Careers" description="Join our team and build a purpose-driven healthcare platform">
      {/* <SimpleHeader title="Careers" /> */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-10 py-10  ">
          {/* Opportunities Section */}
          <div className=" ">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8  ">
              Current Opportunities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map((opportunity, index) => {
                const IconComponent = opportunity.icon;
                return (
                  <div
                    key={index}
                    className={`${opportunity.color} border-l-4 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300`}
                    style={opportunity.borderColor ? { borderLeftColor: opportunity.borderColor } : {}}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0" style={opportunity.iconColor ? { color: opportunity.iconColor } : {}}>
                        <IconComponent className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {opportunity.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {opportunity.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Application Section */}
          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="w-12 h-12 rounded-full bg-store-100 flex items-center justify-center">
                  <FiMail className="w-6 h-6 text-store-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  How to Apply
                </h2>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <FiMail className="w-6 h-6 text-store-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Send Your Resume
                      </h3>
                      <p className="text-gray-700 mb-3">
                        Email your resume to our careers team:
                      </p>
                      <a
                        href="mailto:careers@Rasa Store.com"
                        className="inline-flex items-center gap-2 text-store-600 hover:text-store-700 font-semibold text-sm sm:text-base md:text-lg transition-colors break-all"
                      >
                        <FiMail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="break-all">careers@Rasa Store.com</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <FiUser className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Email Subject Format
                      </h3>
                      <p className="text-gray-700 mb-2">
                        Please use the following format in your email subject:
                      </p>
                      <div className="bg-white rounded-md p-3 border border-gray-200 font-mono text-sm text-gray-800">
                        Position Name – Applicant Name
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        Example: <span className="font-semibold">Licensed Pharmacist – John Doe</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="mt-10 pt-8 border-t border-gray-200">
                <div className="bg-gradient-to-r from-store-500 to-store-600 rounded-lg p-6 text-center text-white">
                  <FiUsers className="w-10 h-10 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Ready to Make a Difference?</h3>
                  <p className="text-store-100 mb-4">
                    Join us in building the future of healthcare
                  </p>
                  <a
                    href="mailto:careers@Rasa Store.com?subject=Career Inquiry"
                    className="inline-block bg-white text-store-600 font-semibold px-6 py-3 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Get Started
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Careers;

