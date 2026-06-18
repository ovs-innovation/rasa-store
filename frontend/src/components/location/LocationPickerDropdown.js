import React, { useState, useEffect, useRef } from "react";
import { FiMapPin, FiLoader, FiCrosshair, FiChevronDown } from "react-icons/fi";
import { IoLocationSharp } from "react-icons/io5";
import Cookies from "js-cookie";
import { notifyError, notifySuccess } from "@utils/toast";
import { useGeolocated } from "react-geolocated";
import LocationServices from "@services/LocationServices";

const LocationPickerDropdown = ({ className = "", hideDivider = false }) => {
  const [location, setLocation] = useState(null);
  const [shouldGetLocation, setShouldGetLocation] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Use react-geolocated hook for availability checks
  const {
    isGeolocationAvailable,
  } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
    userDecisionTimeout: 5000,
    watchPosition: false,
    isOptimisticGeolocationEnabled: false,
    suppressLocationOnMount: true,
    watchLocationPermissionChange: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const savedLocation = Cookies.get("userLocation");
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        setLocation(parsed);
      } catch (error) {
        console.error("Error parsing saved location:", error);
      }
    }
    
    // Listen for location updates
    const handleLocationUpdate = (event) => {
      setLocation(event.detail);
    };

    if (typeof window !== "undefined") {
      window.addEventListener('locationUpdated', handleLocationUpdate);
    }
    
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener('locationUpdated', handleLocationUpdate);
      }
    };
  }, []);

  const saveLocation = (data) => {
    setLocation(data);
    Cookies.set("userLocation", JSON.stringify(data), { expires: 30 });
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent('locationUpdated', { detail: data }));
    }
    setIsOpen(false);
  };

  const handleGeocoding = async (lat, lng) => {
    try {
      const geocodeData = await LocationServices.getReverseGeocode({ lat, lng });
      
      if (geocodeData.status === 'OK' && geocodeData.results && geocodeData.results.length > 0) {
        const result = geocodeData.results[0];
        const address = result.formatted_address || '';
        
        let foundPinCode = '';
        const postalCodeComponent = result.address_components?.find(
          component => component.types.includes('postal_code')
        );
        if (postalCodeComponent) {
          foundPinCode = postalCodeComponent.long_name || postalCodeComponent.short_name || '';
        }

        const locationData = {
          lat,
          lng,
          address: address,
          pinCode: foundPinCode,
          timestamp: Date.now(),
        };
        
        saveLocation(locationData);
        notifySuccess(`Location set successfully! ${foundPinCode ? `PIN: ${foundPinCode}` : ''}`);
      } else {
        const locationData = { lat, lng, timestamp: Date.now() };
        saveLocation(locationData);
        notifySuccess("Location set (coordinates only)");
      }
    } catch (error) {
      console.error("Error getting location details:", error);
      const locationData = { lat, lng, timestamp: Date.now() };
      saveLocation(locationData);
      notifySuccess("Location set (coordinates only)");
    }
  };

  const getCurrentLocation = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!mounted || typeof window === "undefined") return;
    
    if (isGeolocationAvailable === false) {
      notifyError("Geolocation is not supported by your browser");
      return;
    }

    setShouldGetLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setShouldGetLocation(false);
          await handleGeocoding(lat, lng);
        },
        (error) => {
          setShouldGetLocation(false);
          let errorMessage = "Location access denied.";
          if (error.code === error.PERMISSION_DENIED) errorMessage = "Permission denied.";
          else if (error.code === error.POSITION_UNAVAILABLE) errorMessage = "Position unavailable.";
          else if (error.code === error.TIMEOUT) errorMessage = "Timeout.";
          notifyError(errorMessage);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setShouldGetLocation(false);
      notifyError("Geolocation not supported");
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinCode.length === 6 && /^\d+$/.test(pinCode)) {
      const locationData = {
        pinCode: pinCode,
        address: `PIN: ${pinCode}`, // Minimal address representation
        timestamp: Date.now()
      };
      saveLocation(locationData);
      setPinCode("");
      notifySuccess(`Location set to PIN: ${pinCode}`);
    } else {
      notifyError("Please enter a valid 6-digit PIN code");
    }
  };

  const getDisplayText = () => {
    if (shouldGetLocation) return "Getting location...";
    if (location?.address) return location.address;
    if (location?.pinCode) return `PIN: ${location.pinCode}`;
    return "Set location";
  };
  
  // Truncate display text if it's too long
  const displayText = getDisplayText();
  const truncatedText = displayText.length > 25 ? displayText.substring(0, 25) + "..." : displayText;

  return (
    <div className="relative h-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center gap-1 md:gap-2 h-full px-3 md:px-3 text-sm font-sans text-neutral-300 hover:text-white hover:bg-neutral-900/50 transition-colors ${hideDivider ? "" : "border-r border-neutral-800"} ${className}`}
      >
        <FiMapPin className="text-[#D4AF37] flex-shrink-0" size={18} />
        <span className="truncate max-w-[150px] font-medium hidden md:block">{truncatedText}</span>
        <FiChevronDown size={14} className={`text-neutral-400 transition-transform duration-200 hidden md:block ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setIsOpen(false)}></div>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 md:absolute md:top-full md:left-0 mt-2 z-50 w-72 md:w-80 bg-[#0d0d0d] rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-neutral-800/80 overflow-hidden animate-fade-in-down origin-top-left p-5">
            <div className="font-semibold text-white mb-4 text-sm tracking-wide">Choose your location</div>
          
          <div className="relative mb-4">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#D4AF37] rounded-l-md"></div>
            <div className="flex items-center border border-neutral-800 bg-[#121212] rounded-md overflow-hidden focus-within:border-[#D4AF37] focus-within:ring-1 focus-within:ring-[#D4AF37]">
              <input
                type="text"
                placeholder="Enter 6 digit PIN"
                className="w-full px-3 py-2.5 text-sm bg-transparent outline-none text-white placeholder-neutral-500"
                maxLength={6}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit(e)}
              />
              <button 
                onClick={handlePinSubmit}
                className="bg-[#D4AF37] text-black p-3 hover:bg-[#bfa232] transition-colors"
              >
                <FiMapPin size={16} />
              </button>
            </div>
          </div>

          <div className="text-[10px] text-neutral-500 mb-3 font-semibold uppercase tracking-wider text-center flex items-center gap-2 before:content-[''] before:flex-1 before:h-[1px] before:bg-neutral-800 after:content-[''] after:flex-1 after:h-[1px] after:bg-neutral-800">OR</div>

          <button
            onClick={getCurrentLocation}
            disabled={shouldGetLocation}
            className="w-full flex items-center justify-between text-[#D4AF37] bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 px-3 py-2.5 rounded-md transition-all text-sm font-medium"
          >
            <div className="flex items-center gap-3">
              {shouldGetLocation ? (
                 <FiLoader className="animate-spin text-[#D4AF37]" size={18} />
              ) : (
                 <IoLocationSharp className="text-[#D4AF37]" size={20} />
              )}
              <span>Use current location</span>
            </div>
            <FiCrosshair className="text-[#D4AF37]" size={18} />
          </button>
        </div>
        </>
      )}
    </div>
  );
};

export default LocationPickerDropdown;
