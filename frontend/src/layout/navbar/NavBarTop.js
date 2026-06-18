import Link from "next/link";
// import dayjs from "dayjs";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { IoLockOpenOutline } from "react-icons/io5";
import { FiPhoneCall, FiUser, FiMapPin } from "react-icons/fi";
import { signOut } from "next-auth/react";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

//internal import
import { getUserSession } from "@lib/auth";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import CustomerServices from "@services/CustomerServices";
import LocationPickerDropdown from "@components/location/LocationPickerDropdown";

const NavBarTop = () => {
  const userInfo = getUserSession();
  const router = useRouter();
  const [location, setLocation] = useState(null);

  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const storeColor = storeCustomizationSetting?.theme?.color || "green";

  // Load location from cookies on mount
  useEffect(() => {
    const savedLocation = Cookies.get("userLocation");
    if (savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation));
      } catch (error) {
        console.error("Error parsing saved location:", error);
      }
    }

    // Listen for location updates
    const handleLocationUpdate = (event) => {
      setLocation(event.detail);
    };

    window.addEventListener('locationUpdated', handleLocationUpdate);
    return () => {
      window.removeEventListener('locationUpdated', handleLocationUpdate);
    };
  }, []);

  // Fetch shipping address if user is logged in
  const { data: shippingAddressData } = useQuery({
    queryKey: ["shippingAddress", { id: userInfo?.id }],
    queryFn: async () =>
      await CustomerServices.getShippingAddress({
        userId: userInfo?.id,
      }),
    select: (data) => data?.shippingAddress,
    enabled: !!userInfo?.id,
  });

  // Get address to display (prefer shipping address, then location, then user address)
  const getDisplayAddress = () => {
    // First priority: Shipping address (if user is logged in)
    if (userInfo && shippingAddressData && Object.keys(shippingAddressData).length > 0) {
      const addr = shippingAddressData;
      const parts = [
        addr.address,
        addr.area,
        addr.city,
        addr.zipCode,
      ].filter(Boolean);
      return parts.join(", ") || null;
    }
    
    // Second priority: Geolocation address (from cookies)
    if (location?.address) {
      return location.address;
    }
    if (location?.pinCode) {
      return `PIN: ${location.pinCode}`;
    }
    
    // Third priority: User's basic address
    if (userInfo?.address) {
      return userInfo.address;
    }
    
    return null;
  };

  const displayAddress = getDisplayAddress();


  const handleLogOut = () => {
    signOut();
    Cookies.remove("userInfo");
    Cookies.remove("couponInfo");
    router.push("/");
  };

  useEffect(() => {
    if (userInfo && typeof userInfo.token === "string") {
      const decoded = jwtDecode(userInfo.token);

      const expireTime = new Date(decoded?.exp * 1000);
      const currentTime = new Date();

      // console.log(
      //   // decoded,
      //   "expire",
      //   dayjs(expireTime).format("DD, MMM, YYYY, h:mm A"),
      //   "currentTime",
      //   dayjs(currentTime).format("DD, MMM, YYYY, h:mm A")
      // );
      if (currentTime >= expireTime) {
        console.log("token expire, should sign out now..");
        handleLogOut();
      }
    }
  }, [userInfo]);

  return (
    <>
      <div className="bg-black text-neutral-400 py-2.5 border-b border-neutral-900 relative z-[51]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">
          <div className="font-sans text-[10px] tracking-widest font-black uppercase flex justify-between items-center">
            <span className="flex items-center gap-2">
              {displayAddress ? (
                <span className="flex items-center text-neutral-300">
                  <span
                    className="truncate max-w-xs"
                    title={displayAddress}
                  >
                    {displayAddress}
                  </span>
                </span>
              ) : (
                <LocationPickerDropdown className="!p-0 !bg-transparent !border-none text-[10px] tracking-widest font-black font-sans text-neutral-300 hover:text-white transition-colors z-40 h-auto" />
              )}
            </span>

            <div className="lg:text-right flex items-center gap-4 text-neutral-400">
              <Link
                href={userInfo?.token ? "/user/my-account" : "/auth/login"}
                className="hover:text-white transition-colors"
              >
                {showingTranslateValue(
                  storeCustomizationSetting?.navbar?.my_account
                )}
              </Link>
              <span className="text-neutral-700">|</span>
              {userInfo?.token ? (
                <button
                  onClick={handleLogOut}
                  className="flex items-center gap-1 hover:text-white transition-colors uppercase"
                >
                  <IoLockOpenOutline className="text-xs" />
                  {showingTranslateValue(
                    storeCustomizationSetting?.navbar?.logout
                  )}
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <FiUser className="text-xs" />
                  {showingTranslateValue(
                    storeCustomizationSetting?.navbar?.login
                  )}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBarTop;
