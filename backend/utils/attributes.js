const attributes = [
  {
    _id: "63f078f54b86ed26b05281b2",
    type: "attribute",
    extraType: "multiple",
    status: "show",
    title: {
      en: "Color",
    },
    name: {
      en: "Color",
    },
    variants: [
      {
        status: "show",
        _id: "rasa-color-black",
        name: { en: "Black" },
        hexColor: "#000000",
      },
      {
        status: "show",
        _id: "rasa-color-white",
        name: { en: "White" },
        hexColor: "#FFFFFF",
      },
      {
        status: "show",
        _id: "rasa-color-blue",
        name: { en: "Blue" },
        hexColor: "#2563EB",
      },
      {
        status: "show",
        _id: "rasa-color-red",
        name: { en: "Red" },
        hexColor: "#DC2626",
      },
      {
        status: "show",
        _id: "rasa-color-green",
        name: { en: "Green" },
        hexColor: "#16A34A",
      },
      {
        status: "show",
        _id: "rasa-color-brown",
        name: { en: "Brown" },
        hexColor: "#92400E",
      },
      {
        status: "show",
        _id: "rasa-color-pink",
        name: { en: "Pink" },
        hexColor: "#EC4899",
      },
      {
        status: "show",
        _id: "rasa-color-grey",
        name: { en: "Grey" },
        hexColor: "#6B7280",
      },
    ],
    option: "Dropdown",
  },
  {
    _id: "63f078f54b86ed26b05281b6",
    type: "attribute",
    extraType: "multiple",
    status: "show",
    title: {
      en: "Size",
    },
    name: {
      en: "Size",
    },
    variants: [
      { status: "show", _id: "rasa-size-uk3", name: { en: "UK 3" } },
      { status: "show", _id: "rasa-size-uk4", name: { en: "UK 4" } },
      { status: "show", _id: "rasa-size-uk5", name: { en: "UK 5" } },
      { status: "show", _id: "rasa-size-uk6", name: { en: "UK 6" } },
      { status: "show", _id: "rasa-size-uk7", name: { en: "UK 7" } },
      { status: "show", _id: "rasa-size-uk8", name: { en: "UK 8" } },
      { status: "show", _id: "rasa-size-uk9", name: { en: "UK 9" } },
      { status: "show", _id: "rasa-size-uk10", name: { en: "UK 10" } },
    ],
    option: "Radio",
  },
  {
    _id: "63f34946d3639309840ca336",
    type: "extra",
    extraType: "multiple",
    status: "show",
    title: {
      en: "Gift Wrap",
    },
    name: {
      en: "Gift Wrap",
    },
    variants: [
      {
        status: "show",
        _id: "63f34946d3639309840ca337",
        name: {
          en: "Yes",
        },
      },
      {
        status: "show",
        _id: "63f34946d3639309840ca338",
        name: {
          en: "No",
        },
      },
    ],
    option: "Checkbox",
  },
  {
    _id: "63f34983d3639309840ca64a",
    type: "extra",
    extraType: "multiple",
    status: "show",
    title: {
      en: "Package",
    },
    name: {
      en: "Package",
    },
    variants: [
      {
        status: "show",
        _id: "63f34983d3639309840ca64b",
        name: {
          en: "Plastic",
        },
      },
      {
        status: "show",
        _id: "63f34983d3639309840ca64c",
        name: {
          en: "Jar",
        },
      },
      {
        status: "show",
        _id: "63f34983d3639309840ca64d",
        name: {
          en: "Eco Friendly",
        },
      },
    ],
    option: "Checkbox",
  },
];

module.exports = attributes;
