/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

/**
 * Geocode an address to get coordinates
 * @param {string} address - Address string
 * @returns {Promise<{lat: number, lng: number}>} Coordinates
 */
export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'Rasa Store-App'
        }
      }
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

/**
 * Calculate expected delivery time based on distance
 * @param {number} distance - Distance in kilometers
 * @returns {string} Expected delivery time (e.g., "1-2 days")
 */
export const calculateDeliveryTime = (distance) => {
  if (distance <= 5) return "1 day";
  if (distance <= 10) return "2 days";
  return "within a week";
};

/**
 * Get store location coordinates from globalSetting
 * @param {object} globalSetting - Global setting object with address and post_code
 * @returns {Promise<{lat: number, lng: number} | null>} Store coordinates
 */
export const getStoreLocation = async (globalSetting) => {
  if (!globalSetting) {
    console.log('getStoreLocation: globalSetting is null');
    return null;
  }
  
  const address = globalSetting.address || '';
  const postCode = globalSetting.post_code || '';
  
  if (!address && !postCode) {
    console.log('getStoreLocation: Both address and post_code are empty');
    return null;
  }
  
  // Combine address and post code for better geocoding
  const fullAddress = [address, postCode].filter(Boolean).join(', ');
  console.log('getStoreLocation: Geocoding address:', fullAddress);
  
  const result = await geocodeAddress(fullAddress);
  if (!result) {
    console.log('getStoreLocation: Geocoding failed for:', fullAddress);
  } else {
    console.log('getStoreLocation: Geocoding successful:', result);
  }
  
  return result;
};

/**
 * Get user location from cookies or shipping address
 * @param {object} shippingAddress - Shipping address object
 * @returns {Promise<{lat: number, lng: number} | null>} User coordinates
 */
export const getUserLocation = async (shippingAddress = null) => {
  // 1. Try to get from cookies first (Manual override)
  if (typeof window !== 'undefined') {
    try {
      const Cookies = require('js-cookie');
      const savedLocation = Cookies.get('userLocation');
      if (savedLocation) {
        const location = JSON.parse(savedLocation);
        // Accept location if it has coords OR pincode
        if ((location.lat && location.lng) || location.pinCode) {
          console.log('getUserLocation: Using location from cookies:', location);
          return {
            lat: location.lat ? parseFloat(location.lat) : null,
            lng: location.lng ? parseFloat(location.lng) : null,
            pinCode: location.pinCode
          };
        }
      }
    } catch (error) {
      console.error('Error getting user location from cookies:', error);
    }
  }

  // 2. If no cookie, use shipping address if provided
  if (shippingAddress?.lat && shippingAddress?.lng) {
    console.log('getUserLocation: Using coordinates from shipping address');
    return {
      lat: parseFloat(shippingAddress.lat),
      lng: parseFloat(shippingAddress.lng)
    };
  }
  
  // If shipping address is provided but no coordinates, try to geocode it
  if (shippingAddress) {
    const addressParts = [
      shippingAddress.address,
      shippingAddress.area,
      shippingAddress.city,
      shippingAddress.zipCode,
      shippingAddress.country
    ].filter(Boolean);
    
    if (addressParts.length > 0) {
      const fullAddress = addressParts.join(', ');
      console.log('getUserLocation: Geocoding shipping address:', fullAddress);
      const geocoded = await geocodeAddress(fullAddress);
      if (geocoded) {
        console.log('getUserLocation: Geocoding successful:', geocoded);
        return geocoded;
      } else {
        console.log('getUserLocation: Geocoding failed for shipping address');
      }
    } else {
      console.log('getUserLocation: Shipping address provided but no address parts');
    }
  }
  
  console.log('getUserLocation: No user location available');
  return null;
};

/**
 * Calculate and return expected delivery time
 * @param {object} globalSetting - Global setting with store location
 * @param {object} shippingAddress - User shipping address
 * @returns {Promise<string | null>} Expected delivery time or null
 */
export const getExpectedDeliveryTime = async (globalSetting, shippingAddress = null) => {
  // 1. Get user location first (outside try/catch for robust flow control)
  let userLocation = null;
  try {
    userLocation = await getUserLocation(shippingAddress);
  } catch (error) {
    console.error("Error getting user location:", error);
    return null;
  }
  
  if (!userLocation) {
    console.log('Delivery Time: User location not found (no shipping address or cookies)');
    return null; // Show "Check Delivery" UI
  }

  // 2. Attempts calculation, falls back to "3-5 days" if anything else fails
  try {
    // Check if globalSetting exists
    if (!globalSetting) {
      console.log('Delivery Time: globalSetting is missing, returning default');
      return "3-5 days";
    }

    // Get store location
    const storeLocation = await getStoreLocation(globalSetting);
    if (!storeLocation) {
      console.log('Delivery Time: Store location not found, returning default');
      return "1-2 days";
    }

    // Calculate distance if coordinates exist
    if (userLocation.lat && userLocation.lng && storeLocation.lat && storeLocation.lng) {
      const distance = calculateDistance(
        storeLocation.lat,
        storeLocation.lng,
        userLocation.lat,
        userLocation.lng
      );
      
      console.log('Delivery Time: Distance calculated', distance, 'km');
      return calculateDeliveryTime(distance);
    }
    
    console.log('Delivery Time: Using default (missing coordinates)');
    return "1-2 days";
  } catch (error) {
    console.error('Error calculating delivery time (using fallback):', error);
    // User has location, but calculation crashed -> return default time
    return "1-2 days";
  }
};

