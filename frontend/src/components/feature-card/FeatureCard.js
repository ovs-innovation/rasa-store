import React from "react";
import { FiCreditCard, FiGift, FiPhoneCall, FiTruck } from "react-icons/fi";

//internal import
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";

const FeatureCard = () => {
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const storeColor = storeCustomizationSetting?.theme?.color || "green";

  const featurePromo = [
    {
      id: 1,
      title: showingTranslateValue(
        storeCustomizationSetting?.footer?.shipping_card
      ) || "Free Shipping",

      icon: FiTruck,
    },
    {
      id: 2,
      title: showingTranslateValue(
        storeCustomizationSetting?.footer?.support_card
      ) || "24/7 Support",

      icon: FiPhoneCall,
    },
    {
      id: 3,
      title: showingTranslateValue(
        storeCustomizationSetting?.footer?.payment_card
      ) || "Secure Payment",
      icon: FiCreditCard,
    },
    {
      id: 4,
      title: showingTranslateValue(
        storeCustomizationSetting?.footer?.offer_card
      ) || "Daily Offers",
      icon: FiGift,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 mx-auto">
      {featurePromo.map((promo) => (
        <div
          key={promo.id}
          className=" border-r border-store-400 py-1 flex items-center justify-center bg-transparent"
        >
          <div className="mr-3">
            <promo.icon
              className={`flex-shrink-0 h-4 w-4`}
              aria-hidden="true"
            />
          </div>
          <div className="">
            <span className="block font-serif text-sm font-medium leading-5">
              {promo?.title}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureCard;

