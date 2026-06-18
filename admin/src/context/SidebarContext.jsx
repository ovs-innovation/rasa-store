import LanguageServices from "@/services/LanguageServices";
import SettingServices from "@/services/SettingServices";
import { ADMIN_BRAND_LOGO } from "@/utils/cloudinaryUrl";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { createContext, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_THEME_COLOR, getBrandPalette } from "@/utils/themeColors";
import { useTranslation } from "react-i18next";

// create context
export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const resultsPerPage = 20;
  const searchRef = useRef("");
  const invoiceRef = useRef("");
  // const dispatch = useDispatch();

  const [limitData, setLimitData] = useState(20);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("adminSidebarCollapsed") === "true";
    } catch {
      return false;
    }
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBulkDrawerOpen, setIsBulkDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [lang, setLang] = useState("en");
  const [currLang, setCurrLang] = useState({
    iso_code: "en",
    name: "English",
    flag: "US",
  });
  const [time, setTime] = useState("");
  const [sortedField, setSortedField] = useState("");
  const [themeColor, setThemeColor] = useState(DEFAULT_THEME_COLOR);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [zone, setZone] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState(null);
  const [productBrand, setProductBrand] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [method, setMethod] = useState("");
  const [userRole, setUserRole] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [windowDimension, setWindowDimension] = useState(window.innerWidth);
  const [loading, setLoading] = useState(false);
  const [navBar, setNavBar] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });

  const showAlert = (msg, type = "success") => {
    setAlert({ show: true, message: msg, type: type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 4000);
  };
  const { i18n } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);
  const { data: globalSetting } = useQuery({
    queryKey: ["globalSetting"],
    queryFn: async () => await SettingServices.getGlobalSetting(),
    staleTime: 20 * 60 * 1000, //cache for 20 minutes,
    gcTime: 25 * 60 * 1000,
  });

  const { data: storeCustomizationSetting } = useQuery({
    queryKey: ["storeCustomizationSetting"],
    queryFn: async () => await SettingServices.getStoreCustomizationSetting(),
    staleTime: 20 * 60 * 1000,
    gcTime: 25 * 60 * 1000,
  });

  const { data: languages } = useQuery({
    queryKey: ["languages"],
    queryFn: async () => await LanguageServices.getShowingLanguage(),
    staleTime: 20 * 60 * 1000, //cache for 20 minutes,
    gcTime: 25 * 60 * 1000,
  });

  const brandPalette = useMemo(
    () => getBrandPalette(themeColor).palette,
    [themeColor]
  );

  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("adminSidebarCollapsed", String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const closeBulkDrawer = () => setIsBulkDrawerOpen(false);
  const toggleBulkDrawer = () => setIsBulkDrawerOpen(!isBulkDrawerOpen);

  const closeModal = () => setIsModalOpen(false);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleLanguageChange = (value) => {
    // console.log("handleChangeLang", value);

    Cookies.set("i18next", value?.iso_code, {
      sameSite: "None",
      secure: true, // Include the "secure" attribute
    });
    i18n.changeLanguage(value?.iso_code);
    setLang(value?.iso_code);
    Cookies.set("_currLang", JSON.stringify(value), {
      sameSite: "None",
      secure: true, // Include the "secure" attribute
    });
    setCurrLang(value);
  };

  const handleChangePage = (p) => {
    setCurrentPage(p);
  };

  const handleSubmitForAll = (e) => {
    e.preventDefault();
    if (!searchRef?.current?.value) return setSearchText(null);
    setSearchText(searchRef?.current?.value);
    setCategory(null);
  };

  // console.log("globalSetting", globalSetting, "languages", languages);

  useEffect(() => {
    ["icon", "shortcut icon", "apple-touch-icon"].forEach((rel) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = ADMIN_BRAND_LOGO;
    });
    if (globalSetting?.company_name) {
      document.title = globalSetting.company_name + " | Admin Dashboard";
    }
  }, [globalSetting]);

  useEffect(() => {
    const pathname = window?.location.pathname === "/login";

    // if (pathname) return;
    const defaultLang = globalSetting?.default_language || "en";
    const cookieLang = Cookies.get("i18next");
    const cookieCurrLang = Cookies.get("_currLang");

    const removeRegion = (langCode) => langCode?.split("-")[0];

    let selectedLang = removeRegion(cookieLang || defaultLang);

    // Ensure language consistency with global settings
    if (globalSetting?.default_language) {
      selectedLang = removeRegion(globalSetting.default_language);
    }

    // Update state with selected language
    setLang(selectedLang);

    // Set i18next language & update cookies **only when needed**
    if (!cookieLang || cookieLang !== selectedLang) {
      Cookies.set("i18next", selectedLang, {
        sameSite: "None",
        secure: true,
      });
    }

    // Change i18n language **only if it differs**
    if (i18n.language !== selectedLang && !cookieCurrLang) {
      i18n.changeLanguage(selectedLang);
    }

    // Find the corresponding language object
    if (Array.isArray(languages) && languages.length > 0 && !pathname && !cookieCurrLang) {
      const result = languages.find((lang) => lang?.iso_code === selectedLang);
      if (result) {
        setCurrLang(result);
      }
    }
  }, [globalSetting?.default_language, languages]); // Add `languages` as a dependency

  useEffect(() => {
    if (storeCustomizationSetting?.theme?.color) {
      setThemeColor(storeCustomizationSetting.theme.color);
    } else {
      setThemeColor(DEFAULT_THEME_COLOR);
    }
  }, [storeCustomizationSetting?.theme?.color]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    Object.entries(brandPalette || {}).forEach(([shade, value]) => {
      root.style.setProperty(`--brand-${shade}`, value);
    });
    root.style.setProperty("--brand-token", themeColor);
  }, [brandPalette, themeColor]);

  useEffect(() => {
    function handleResize() {
      setWindowDimension(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        method,
        setMethod,
        userRole,
        setUserRole,
        isSidebarOpen,
        toggleSidebar,
        closeSidebar,
        sidebarCollapsed,
        toggleSidebarCollapse,
        isDrawerOpen,
        toggleDrawer,
        closeDrawer,
        setIsDrawerOpen,
        closeBulkDrawer,
        isBulkDrawerOpen,
        toggleBulkDrawer,
        isModalOpen,
        toggleModal,
        closeModal,
        isUpdate,
        setIsUpdate,
        lang,
        setLang,
        currLang,
        handleLanguageChange,
        currentPage,
        setCurrentPage,
        handleChangePage,
        searchText,
        setSearchText,
        category,
        productBrand,
        setCategory,
        setProductBrand,
        searchRef,
        handleSubmitForAll,
        status,
        setStatus,
        zone,
        setZone,
        time,
        setTime,
        sortedField,
        setSortedField,
        resultsPerPage,
        limitData,
        setLimitData,
        windowDimension,
        modalOpen,
        setModalOpen,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        loading,
        setLoading,
        invoice,
        setInvoice,
        invoiceRef,
        setNavBar,
        navBar,
        tabIndex,
        setTabIndex,
        themeColor,
        themePalette: brandPalette,
        globalSetting,
        alert,
        showAlert,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
