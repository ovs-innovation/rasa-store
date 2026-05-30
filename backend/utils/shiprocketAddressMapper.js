const DEFAULT_COUNTRY = "India";

const INDIAN_STATE_ALIASES = {
  orissa: "Odisha",
  pondicherry: "Puducherry",
  "nct of delhi": "Delhi",
  "dadra and nagar haveli": "Dadra and Nagar Haveli and Daman and Diu",
  "daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
};

const INDIAN_STATES = new Set(
  [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ].map((s) => s.toLowerCase())
);

function normalizeToken(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function titleCaseWords(str) {
  return str
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function canonicalIndianState(value) {
  const trimmed = normalizeToken(value);
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();
  if (INDIAN_STATE_ALIASES[lower]) {
    return INDIAN_STATE_ALIASES[lower];
  }

  if (INDIAN_STATES.has(lower)) {
    return titleCaseWords(trimmed);
  }

  return "";
}

function isIndiaCountry(value) {
  const lower = normalizeToken(value).toLowerCase();
  return !lower || lower === "india" || lower === "in" || lower === "ind";
}

/**
 * Legacy data stores Indian state names in `country`. Normalize for Shiprocket.
 */
function normalizeCountryState(country, state) {
  let normalizedCountry = normalizeToken(country);
  let normalizedState = normalizeToken(state);

  const stateFromCountry = canonicalIndianState(normalizedCountry);
  if (stateFromCountry) {
    if (!normalizedState) {
      normalizedState = stateFromCountry;
    }
    normalizedCountry = DEFAULT_COUNTRY;
  }

  const stateFromStateField = canonicalIndianState(normalizedState);
  if (stateFromStateField) {
    normalizedState = stateFromStateField;
    if (!normalizedCountry || isIndiaCountry(normalizedCountry)) {
      normalizedCountry = DEFAULT_COUNTRY;
    }
  }

  if (isIndiaCountry(normalizedCountry)) {
    normalizedCountry = DEFAULT_COUNTRY;
  }

  return {
    country: normalizedCountry || DEFAULT_COUNTRY,
    state: normalizedState,
  };
}

function mapShiprocketAddressFields(payload = {}) {
  const billing = normalizeCountryState(
    payload.billing_country,
    payload.billing_state
  );
  const shipping = normalizeCountryState(
    payload.shipping_country || payload.billing_country,
    payload.shipping_state || payload.billing_state
  );

  return {
    ...payload,
    billing_country: billing.country,
    billing_state: billing.state || payload.billing_city || "",
    shipping_country: shipping.country,
    shipping_state:
      shipping.state || payload.shipping_city || billing.state || "",
  };
}

module.exports = {
  normalizeCountryState,
  mapShiprocketAddressFields,
};
