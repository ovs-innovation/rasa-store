import Link from "next/link";
// import dayjs from "dayjs";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { IoLockOpenOutline } from "react-icons/io5";
import { FiUser } from "react-icons/fi";
import { signOut } from "next-auth/react";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";

//internal import
import { getUserSession } from "@lib/auth";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";

const NavBarTop = () => {
  const userInfo = getUserSession();
  const router = useRouter();

  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

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
          <div className="font-sans text-[10px] tracking-widest font-black uppercase flex justify-end items-center">
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
