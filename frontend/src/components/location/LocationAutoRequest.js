import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

const LocationAutoRequest = () => {
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    // Check if location is already saved
    const savedLocation = Cookies.get("userLocation");
    
    // Don't request if location already exists or if we've already requested
    if (savedLocation || hasRequested) {
      return;
    }

    // Check if geolocation is available
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      return;
    }

    // Request location as soon as possible
    const checkAndRequestLocation = async () => {
      try {
        // Check if Permissions API is available
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
            
            // If permission was previously denied, don't auto-request
            if (permissionStatus.state === 'denied') {
              console.log("Location permission previously denied");
              return;
            }
            
            // If permission is granted, get location immediately
            if (permissionStatus.state === 'granted') {
              requestLocation();
              return;
            }
            
            // If prompt state, request immediately (try to trigger popup)
            if (permissionStatus.state === 'prompt') {
              requestLocation();
              return;
            }
          } catch (permError) {
            // Permissions API might not be fully supported, proceed to direct request
            console.log("Permissions API error, requesting directly:", permError);
          }
        }
        
        // Fallback: request location directly (minimal delay for browser to be ready)
        // Some browsers allow location requests on page load
        setTimeout(() => {
          requestLocation();
        }, 500); // Reduced to 500ms
      } catch (error) {
        // Final fallback: request after minimal delay
        console.log("Error in location request flow, trying after delay:", error);
        setTimeout(() => {
          requestLocation();
        }, 500);
      }
    };

    const requestLocation = () => {
      if (hasRequested) return;
      setHasRequested(true);
      
      console.log("Requesting location permission...");
      
      // This will trigger the browser's native location permission popup
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log("Auto location:", lat, lng);

          try {
            // Try to get address from coordinates using Nominatim
            const geocodeResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'Rasa Store-App'
                }
              }
            );
            
            const geocodeData = await geocodeResponse.json();
            const address = geocodeData?.display_name || '';
            const pinCode = geocodeData?.address?.postcode || '';

            // Save location to cookies
            const locationData = {
              lat,
              lng,
              address: address,
              pinCode: pinCode,
              timestamp: Date.now(),
            };

            Cookies.set("userLocation", JSON.stringify(locationData), { expires: 30 });
            
            // Trigger custom event to update NavBarTop
            window.dispatchEvent(new CustomEvent('locationUpdated', { detail: locationData }));
          } catch (error) {
            console.error("Error getting location details:", error);
            // Still save coordinates even if geocoding fails
            const locationData = {
              lat,
              lng,
              timestamp: Date.now(),
            };
            Cookies.set("userLocation", JSON.stringify(locationData), { expires: 30 });
            window.dispatchEvent(new CustomEvent('locationUpdated', { detail: locationData }));
          }
        },
        (error) => {
          console.log("Auto location request denied or failed:", error);
          // Don't show error notification on auto-request to avoid annoying users
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    };

    checkAndRequestLocation();
  }, [hasRequested]);

  return null; // This component doesn't render anything
};

export default LocationAutoRequest;

