const router = require("express").Router();
const { isAuth, isAdmin } = require("../config/auth");

const {
  addGlobalSetting,
  getGlobalSetting,
  updateGlobalSetting,
  addStoreSetting,
  getStoreSetting,
  updateStoreSetting,
  getStoreSeoSetting,
  addStoreCustomizationSetting,
  getStoreCustomizationSetting,
  updateStoreCustomizationSetting,
  addVendorSetting,
  getVendorSetting,
  updateVendorSetting,
} = require("../controller/settingController");

//add a global setting
router.post("/global/add", isAuth, isAdmin, addGlobalSetting);

//get global setting
router.get("/global/all", getGlobalSetting);

//update global setting
router.put("/global/update", isAuth, isAdmin, updateGlobalSetting);

//add a store setting
router.post("/store-setting/add", isAuth, isAdmin, addStoreSetting);

//get store setting
router.get("/store-setting/all", getStoreSetting);

//get store setting
router.get("/store-setting/seo", getStoreSeoSetting);

//update store setting
router.put("/store-setting/update", isAuth, isAdmin, updateStoreSetting);

//store customization routes

//add a online store customization setting
router.post("/store/customization/add", isAuth, isAdmin, addStoreCustomizationSetting);

//get online store customization setting
router.get("/store/customization/all", getStoreCustomizationSetting);

//update online store customization setting
router.put("/store/customization/update", isAuth, isAdmin, updateStoreCustomizationSetting);


//vendor setting routes
router.post("/vendor-setting/add", isAuth, isAdmin, addVendorSetting);
router.get("/vendor-setting/all", getVendorSetting);
router.put("/vendor-setting/update", isAuth, isAdmin, updateVendorSetting);

module.exports = router;
