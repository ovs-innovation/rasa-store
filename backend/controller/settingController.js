//models
const Setting = require("../models/Setting");

//global setting controller
const addGlobalSetting = async (req, res) => {
  try {
    const newGlobalSetting = new Setting(req.body);
    await newGlobalSetting.save();
    res.send({
      message: "Global Setting Added Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getGlobalSetting = async (req, res) => {
  try {
    const globalSetting = await Setting.findOne({ name: "globalSetting" });
    if (!globalSetting) {
      return res.send({});
    }
    res.send(globalSetting.setting);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateGlobalSetting = async (req, res) => {
  try {
    const { setting } = req.body;

    // Construct the $set object dynamically
    const setObject = Object.keys(setting).reduce((acc, key) => {
      acc[`setting.${key}`] = setting[key];
      return acc;
    }, {});

    const globalSetting = await Setting.findOneAndUpdate(
      { name: "globalSetting" },
      { $set: setObject },
      { new: true, upsert: true }
    );

    res.send({
      data: globalSetting,
      message: "Global Setting Update Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

//store setting controller
const addStoreSetting = async (req, res) => {
  try {
    const newStoreSetting = new Setting(req.body);
    await newStoreSetting.save();
    res.send({
      message: "Store Setting Added Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getStoreSetting = async (req, res) => {
  try {
    const storeSetting = await Setting.findOne({ name: "storeSetting" });
    if (!storeSetting) {
      return res.send({});
    }
    res.send(storeSetting.setting);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateStoreSetting = async (req, res) => {
  try {
    const { setting } = req.body;

    // Dynamically build the update fields
    const updateFields = Object.keys(setting).reduce((acc, key) => {
      acc[`setting.${key}`] = setting[key];
      return acc;
    }, {});
    // Update the online store setting document
    const storeSetting = await Setting.findOneAndUpdate(
      { name: "storeSetting" },
      { $set: updateFields },
      { new: true, upsert: true } // upsert to create the document if it doesn't exist
    );

    res.send({
      data: storeSetting,
      message: "Store Setting Update Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

//vendor setting controller
const addVendorSetting = async (req, res) => {
  try {
    const newVendorSetting = new Setting(req.body);
    await newVendorSetting.save();
    res.send({
      message: "Vendor Setting Added Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getVendorSetting = async (req, res) => {
  try {
    const vendorSetting = await Setting.findOne({ name: "vendorSetting" });
    if (!vendorSetting) {
      return res.send({});
    }
    res.send(vendorSetting.setting);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateVendorSetting = async (req, res) => {
  try {
    const { setting } = req.body;
    const updateFields = Object.keys(setting).reduce((acc, key) => {
      acc[`setting.${key}`] = setting[key];
      return acc;
    }, {});
    const vendorSetting = await Setting.findOneAndUpdate(
      { name: "vendorSetting" },
      { $set: updateFields },
      { new: true, upsert: true }
    );
    res.send({
      data: vendorSetting,
      message: "Vendor Setting Update Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

//online store customization controller
const addStoreCustomizationSetting = async (req, res) => {
  try {
    const newStoreCustomizationSetting = new Setting(req.body);
    const storeCustomizationSetting = await newStoreCustomizationSetting.save();

    res.send({
      data: storeCustomizationSetting,
      message: "Online Store Customization Setting Added Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getStoreCustomizationSetting = async (req, res) => {
  try {
    const { key, keyTwo } = req.query;

    let projection = {};
    if (key) {
      projection[`setting.${key}`] = 1;
    }
    if (keyTwo) {
      projection[`setting.${keyTwo}`] = 1;
    }

    // If neither key nor keyTwo is provided, fetch all settings
    if (!key && !keyTwo) {
      projection = { setting: 1 };
    }

    const storeCustomizationSetting = await Setting.findOne(
      { name: "storeCustomizationSetting" },
      projection
    ).sort({ updatedAt: -1 });

    if (!storeCustomizationSetting) {
      return res.send({});
    }

    res.send(storeCustomizationSetting.setting);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getStoreSeoSetting = async (req, res) => {
  try {
    const storeCustomizationSetting = await Setting.findOne(
      {
        name: "storeCustomizationSetting",
      },
      { "setting.seo": 1, _id: 0 }
    );
    res.send(storeCustomizationSetting?.setting || {});
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateStoreCustomizationSetting = async (req, res) => {
  try {
    const { setting } = req.body;

    if (!setting || typeof setting !== "object") {
      return res.status(400).send({ message: "Invalid setting payload" });
    }

    let storeCustomizationSetting = await Setting.findOne({
      name: "storeCustomizationSetting",
    }).sort({ updatedAt: -1 });

    if (!storeCustomizationSetting) {
      storeCustomizationSetting = new Setting({
        name: "storeCustomizationSetting",
        setting: {},
      });
    }

    storeCustomizationSetting.setting = {
      ...(storeCustomizationSetting.setting || {}),
      ...setting,
    };
    storeCustomizationSetting.markModified("setting");
    await storeCustomizationSetting.save();

    res.send({
      data: storeCustomizationSetting,
      message: "Online Store Customization Setting Update Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// deliveryman setting
const addDeliverymanSetting = async (req, res) => {
  try {
    const newSetting = new Setting(req.body);
    await newSetting.save();
    res.status(200).send({
      message: "Deliveryman setting added successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getDeliverymanSetting = async (req, res) => {
  try {
    const setting = await Setting.findOne({ name: "deliverymanSetting" });
    res.send(setting?.setting || {});
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateDeliverymanSetting = async (req, res) => {
  try {
    const setting = await Setting.findOneAndUpdate(
      { name: "deliverymanSetting" },
      {
        $set: {
          setting: req.body,
        },
      },
      {
        new: true,
      }
    );
    res.send({
      message: "Deliveryman setting updated successfully!",
      setting: setting.setting,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

module.exports = {
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
  addDeliverymanSetting,
  getDeliverymanSetting,
  updateDeliverymanSetting,
};
