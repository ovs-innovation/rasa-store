import React, { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import {
   FiInfo, FiRefreshCw, FiSave, FiCheck, FiAlertCircle, FiMap, FiSearch,
   FiChevronDown, FiImage, FiGlobe, FiClock, FiDollarSign, FiShield,
   FiSettings, FiMapPin, FiMail, FiPhone,
} from "react-icons/fi";

// internal import
import PageTitle from "@/components/Typography/PageTitle";
import AnimatedContent from "@/components/common/AnimatedContent";
import SwitchToggle from "@/components/form/switch/SwitchToggle";
import SettingServices from "@/services/SettingServices";
import { SidebarContext } from "@/context/SidebarContext";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import Loading from "@/components/preloader/Loading";
import Uploader from "@/components/image-uploader/Uploader";

const BusinessSettings = () => {
   const { t } = useTranslation();
   const { showAlert } = useContext(SidebarContext);
   const [isLoading, setIsLoading] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [settings, setSettings] = useState({
      maintenanceMode: false,
      businessName: "RASA",
      email: "info@rasastore.com",
      phone: "9100000000",
      phoneCountry: "IN",
      country: "India",
      address: "New Delhi, India",
      latitude: "28.6139",
      longitude: "77.2090",
      logo: "",
      favicon: "",
      timezone: "(GMT+05:30) Asia/Kolkata",
      timeFormat: "12 Hours",
      currencySymbol: "INR (₹)",
      currencyPosition: "(₹) Left",
      decimalPoint: "2",
      businessModels: ["Commission"],
      commissionRateOrder: "10",
      commissionRateDelivery: "5",
      additionalChargeStatus: true,
      additionalChargeName: "Service Charge",
      additionalChargeAmount: "10",
      countryPickerStatus: false,
      copyrightText: "© 2026 RASA. All rights reserved.",
      cookiesText: "We use cookies to improve your experience on our site.",
   });

   useEffect(() => {
      const fetchSettings = async () => {
         try {
            const res = await SettingServices.getGlobalSetting();
            if (res && Object.keys(res).length > 0) {
               setSettings((prev) => ({
                  ...prev,
                  maintenanceMode: res.maintenance_mode ?? prev.maintenanceMode,
                  businessName: res.business_name ?? prev.businessName,
                  email: res.email ?? prev.email,
                  phone: res.phone ?? prev.phone,
                  phoneCountry: res.phone_country ?? prev.phoneCountry,
                  country: res.country ?? prev.country,
                  address: res.address ?? prev.address,
                  latitude: res.latitude ?? prev.latitude,
                  longitude: res.longitude ?? prev.longitude,
                  logo: res.logo ?? prev.logo,
                  favicon: res.favicon ?? prev.favicon,
                  timezone: res.timezone ?? prev.timezone,
                  timeFormat: res.time_format ?? prev.timeFormat,
                  currencySymbol: res.currency_symbol ?? prev.currencySymbol,
                  currencyPosition: res.currency_position ?? prev.currencyPosition,
                  decimalPoint: String(res.decimal_point ?? prev.decimalPoint),
                  businessModels: Array.isArray(res.business_models) ? res.business_models : (res.business_model ? [res.business_model] : prev.businessModels),
                  commissionRateOrder: String(res.commission_rate_order ?? prev.commissionRateOrder),
                  commissionRateDelivery: String(res.commission_rate_delivery ?? prev.commissionRateDelivery),
                  additionalChargeStatus: res.additional_charge_status ?? prev.additionalChargeStatus,
                  additionalChargeName: res.additional_charge_name ?? prev.additionalChargeName,
                  additionalChargeAmount: String(res.additional_charge_amount ?? prev.additionalChargeAmount),
                  countryPickerStatus: res.country_picker_status ?? prev.countryPickerStatus,
                  copyrightText: res.copyright_text ?? prev.copyrightText,
                  cookiesText: res.cookies_text ?? prev.cookiesText,
               }));
            }
         } catch (error) {
            console.error("Error fetching settings:", error);
         } finally {
            setIsLoading(false);
         }
      };
      fetchSettings();
   }, []);

   const updateSetting = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

   const handleSave = async (specificPayload = null) => {
      setIsSubmitting(true);
      try {
         const payload = {
            name: "globalSetting",
            setting: specificPayload || {
               maintenance_mode: settings.maintenanceMode,
               business_name: settings.businessName,
               email: settings.email,
               phone: settings.phone,
               phone_country: settings.phoneCountry,
               country: settings.country,
               address: settings.address,
               latitude: settings.latitude,
               longitude: settings.longitude,
               logo: settings.logo,
               favicon: settings.favicon,
               timezone: settings.timezone,
               time_format: settings.timeFormat,
               currency_symbol: settings.currencySymbol,
               currency_position: settings.currencyPosition,
               decimal_point: Number(settings.decimalPoint),
               business_models: settings.businessModels,
               commission_rate_order: Number(settings.commissionRateOrder),
               commission_rate_delivery: Number(settings.commissionRateDelivery),
               additional_charge_status: settings.additionalChargeStatus,
               additional_charge_name: settings.additionalChargeName,
               additional_charge_amount: Number(settings.additionalChargeAmount),
               country_picker_status: settings.countryPickerStatus,
               copyright_text: settings.copyrightText,
               cookies_text: settings.cookiesText,
            },
         };
         const res = await SettingServices.updateGlobalSetting(payload);
         showAlert(res.message || "Settings updated successfully!", "success");
      } catch (error) {
         showAlert(error?.response?.data?.message || error?.message || "Something went wrong", "error");
      } finally {
         setIsSubmitting(false);
      }
   };

   if (isLoading) return <Loading />;

   return (
      <div className="bg-[#f8fafc] min-h-screen dark:bg-gray-950 pb-20">
         <div className="max-w-[1400px] mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
               <div>
                  <PageTitle>Business Settings</PageTitle>
                  <p className="text-slate-500 dark:text-gray-400 mt-2 text-lg">Manage your business identity, location, and global configurations.</p>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300">
                     <FiRefreshCw /> Reset
                  </button>
                  <button onClick={() => handleSave()} disabled={isSubmitting} className="flex items-center gap-2 px-8 py-3 bg-teal-600 text-white font-bold rounded-2xl shadow-xl shadow-teal-600/20 hover:bg-teal-700 active:scale-95 transition-all">
                     {isSubmitting ? <FiRefreshCw className="animate-spin" /> : <FiSave />} Save All
                  </button>
               </div>
            </div>

            <AnimatedContent>
               <div className="space-y-10">
                  {/* Maintenance Section */}
                  <div className="bg-white border border-slate-200/60 rounded-[32px] p-8 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                     <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex gap-5 items-start">
                           <div className="p-4 bg-amber-50 rounded-2xl dark:bg-amber-900/20"><FiShield className="w-8 h-8 text-amber-600" /></div>
                           <div>
                              <h3 className="text-2xl font-black text-slate-800 dark:text-white">Maintenance Mode</h3>
                              <p className="text-slate-500 max-w-xl">Temporarily disable customer access for maintenance or updates.</p>
                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                           <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-3xl dark:bg-gray-800 dark:border-gray-700">
                              <span className="font-bold text-slate-600">{settings.maintenanceMode ? 'ACTIVE' : 'OFF'}</span>
                              <SwitchToggle processOption={settings.maintenanceMode} handleProcess={() => updateSetting("maintenanceMode", !settings.maintenanceMode)} />
                           </div>
                           <button onClick={() => handleSave({ maintenance_mode: settings.maintenanceMode })} className="text-xs font-bold text-teal-600 underline">Update Status Only</button>
                        </div>
                     </div>
                  </div>

                  {/* Basic Info Section */}
                  <Section title="Identity & Location" icon={<FiGlobe className="text-teal-500" />} onSave={() => handleSave()}>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Input label="Business Name" value={settings.businessName} onChange={v => updateSetting("businessName", v)} />
                        <Input label="Support Email" value={settings.email} onChange={v => updateSetting("email", v)} />
                        <div className="space-y-3">
                           <label className="text-sm font-bold text-slate-700 dark:text-gray-300 ml-1">Phone Number</label>
                           <div className="flex h-14 bg-white border border-slate-200 rounded-2xl overflow-hidden focus-within:border-teal-500 transition-all dark:bg-gray-800 dark:border-gray-700 font-bold">
                              <div className="flex items-center px-4 bg-slate-50 border-r border-slate-200 dark:bg-gray-900 dark:border-gray-700">🇮🇳 +91</div>
                              <input value={settings.phone} onChange={e => updateSetting("phone", e.target.value)} className="flex-1 px-4 outline-none dark:bg-gray-950 text-slate-700 dark:text-white" />
                           </div>
                        </div>
                        <Select label="Country" value={settings.country} options={["India"]} onChange={v => updateSetting("country", v)} />
                        <div className="md:col-span-2 space-y-3">
                           <label className="text-sm font-bold text-slate-700 dark:text-gray-300 ml-1">Business Address</label>
                           <textarea value={settings.address} onChange={e => updateSetting("address", e.target.value)} rows="2" className="w-full bg-white border border-slate-200 rounded-2xl p-4 outline-none focus:border-teal-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold" />
                        </div>
                     </div>

                     {/* Interactive Map Section */}
                     <div className="mt-10 space-y-6">
                        <label className="text-sm font-bold text-slate-700 dark:text-gray-300 ml-1 flex justify-between items-center">
                           <div className="flex items-center gap-2">
                              <FiMapPin className="text-teal-600" />
                              <span>Store Location on Map</span>
                           </div>
                           <div className="flex gap-4">
                              <span className="text-xs bg-slate-900 text-white px-4 py-1.5 rounded-full font-black tracking-tighter">LAT: {settings.latitude}</span>
                              <span className="text-xs bg-teal-600 text-white px-4 py-1.5 rounded-full font-black tracking-tighter">LNG: {settings.longitude}</span>
                           </div>
                        </label>
                        
                        <MapPicker 
                           latitude={settings.latitude} 
                           longitude={settings.longitude} 
                           onChange={(lat, lng) => {
                              updateSetting("latitude", String(lat));
                              updateSetting("longitude", String(lng));
                           }} 
                        />
                        
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3 dark:bg-amber-900/10 dark:border-amber-900/30">
                           <FiAlertCircle className="text-amber-600 mt-1 shrink-0" />
                           <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed font-medium">
                              <strong className="block mb-1">How to set your location:</strong>
                              Search for your locality or drag the pin. The coordinates will update automatically. Don't forget to click "Save Section" above to persist changes.
                           </p>
                        </div>
                     </div>

                     {/* Assets */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
                        <div className="p-8 bg-slate-50 rounded-[32px] dark:bg-gray-900/50">
                           <h4 className="font-black mb-6 flex items-center gap-2"><FiImage className="text-teal-500" /> Store Logo</h4>
                           <Uploader imageUrl={settings.logo} setImageUrl={u => updateSetting("logo", u)} folder="business" />
                        </div>
                        <div className="p-8 bg-slate-50 rounded-[32px] dark:bg-gray-900/50">
                           <h4 className="font-black mb-6 flex items-center gap-2"><FiGlobe className="text-emerald-500" /> Favicon</h4>
                           <Uploader imageUrl={settings.favicon} setImageUrl={u => updateSetting("favicon", u)} folder="favicon" />
                        </div>
                     </div>
                  </Section>

                  {/* Operational Section */}
                  <Section title="Operational Settings" icon={<FiClock className="text-emerald-500" />} onSave={() => handleSave()}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <Select label="Time Zone" value={settings.timezone} options={["(GMT+05:30) Asia/Kolkata"]} onChange={v => updateSetting("timezone", v)} />
                        <Radio label="Time Format" active={settings.timeFormat} options={["12 Hours", "24 Hours"]} onChange={v => updateSetting("timeFormat", v)} />
                        <div className="md:col-span-2 p-8 bg-teal-50/30 border border-teal-100 rounded-[32px] grid grid-cols-1 md:grid-cols-3 gap-8 dark:bg-teal-900/5 dark:border-teal-900/20">
                           <Select label="Currency" value={settings.currencySymbol} options={["INR (₹)"]} onChange={v => updateSetting("currencySymbol", v)} />
                           <Radio label="Currency Position" active={settings.currencyPosition} options={["(₹) Left", "(₹) Right"]} onChange={v => updateSetting("currencyPosition", v)} />
                           <Input label="Decimal Points" type="number" value={settings.decimalPoint} onChange={v => updateSetting("decimalPoint", v)} />
                        </div>
                     </div>
                  </Section>

                  {/* Business Model Section */}
                  <Section title="Business Model" icon={<FiSettings className="text-blue-500" />} onSave={() => handleSave()}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ModelCard title="Subscription" desc="Fixed recurring fee model for vendors." checked={settings.businessModels.includes("Subscription")} onClick={() => toggleModel("Subscription")} icon={<FiCheck />} />
                        <ModelCard title="Commission" desc="Percentage shared per order transaction." checked={settings.businessModels.includes("Commission")} onClick={() => toggleModel("Commission")} icon={<FiDollarSign />} />
                        <Input label="Order Commission (%)" value={settings.commissionRateOrder} onChange={v => updateSetting("commissionRateOrder", v)} />
                        <Input label="Delivery Surcharge (%)" value={settings.commissionRateDelivery} onChange={v => updateSetting("commissionRateDelivery", v)} />
                     </div>
                  </Section>

                  {/* Charges Section */}
                  <Section title="Service Charges" icon={<FiDollarSign className="text-orange-500" />} onSave={() => handleSave()} toggle={<SwitchToggle processOption={settings.additionalChargeStatus} handleProcess={() => updateSetting("additionalChargeStatus", !settings.additionalChargeStatus)} />}>
                     {settings.additionalChargeStatus && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fadeIn">
                        <Input label="Charge Name" value={settings.additionalChargeName} onChange={v => updateSetting("additionalChargeName", v)} />
                        <Input label="Amount (₹)" type="number" value={settings.additionalChargeAmount} onChange={v => updateSetting("additionalChargeAmount", v)} />
                        </div>
                     )}
                  </Section>

                  {/* Legal Section */}
                  <Section title="Legal & Compliance" icon={<FiShield className="text-purple-500" />} onSave={() => handleSave()}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <Textarea label="Copyright Text" value={settings.copyrightText} onChange={v => updateSetting("copyrightText", v)} />
                        <Textarea label="Cookies Policy Text" value={settings.cookiesText} onChange={v => updateSetting("cookiesText", v)} />
                     </div>
                  </Section>
               </div>
            </AnimatedContent>
         </div>
      </div>
   );

   function toggleModel(m) {
      setSettings(p => ({ ...p, businessModels: p.businessModels.includes(m) ? p.businessModels.filter(x => x !== m) : [...p.businessModels, m] }));
   }
};

const Section = ({ title, icon, children, onSave, toggle }) => (
   <div className="bg-white border border-slate-200/60 rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-700 dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
      <div className="p-8 md:p-10">
         <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50 dark:border-gray-800">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-slate-50 rounded-2xl dark:bg-gray-800 shadow-sm">{icon}</div>
               <h3 className="text-2xl font-black text-slate-800 dark:text-white">{title}</h3>
            </div>
            <div className="flex items-center gap-4">
               {toggle}
               <button onClick={onSave} className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white font-bold rounded-2xl hover:bg-black transition-all dark:bg-gray-700">
                  <FiSave /> Save Section
               </button>
            </div>
         </div>
         {children}
      </div>
   </div>
);

const Input = ({ label, value, onChange, type = "text", placeholder }) => (
   <div className="space-y-3">
      <label className="text-sm font-bold text-slate-700 dark:text-gray-300 ml-1">{label}</label>
      <div className="relative group">
         <input 
            type={type} 
            value={value} 
            onChange={e => onChange(type === "number" ? Math.max(0, parseFloat(e.target.value) || 0) : e.target.value)} 
            min={type === "number" ? "0" : undefined}
            onKeyDown={type === "number" ? (e => (e.key === '-' || e.key === 'e') && e.preventDefault()) : undefined}
            placeholder={placeholder}
            className="w-full h-14 px-6 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold outline-none focus:border-teal-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white text-left placeholder:text-slate-300 shadow-sm" 
         />
      </div>
   </div>
);

const Select = ({ label, value, options, onChange }) => (
   <div className="space-y-3">
      <label className="text-sm font-bold text-slate-700 dark:text-gray-300 ml-1">{label}</label>
      <div className="relative group">
         <select 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="w-full h-14 px-6 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold appearance-none outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white text-left shadow-sm"
         >
            {options.map(o => <option key={o} value={o}>{o}</option>)}
         </select>
         <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
   </div>
);

const Radio = ({ label, active, options, onChange }) => (
   <div className="space-y-3">
      <label className="text-sm font-bold text-slate-700 dark:text-gray-300 ml-1">{label}</label>
      <div className="flex gap-3 bg-slate-50 border border-slate-100 p-2 rounded-[24px] dark:bg-gray-800 dark:border-gray-700">
         {options.map(o => (
            <button key={o} onClick={() => onChange(o)} className={`flex-1 h-11 rounded-2xl font-black text-sm transition-all ${active === o ? 'bg-white shadow-lg text-teal-600 dark:bg-gray-900 border' : 'text-slate-400'}`}>
               {o}
            </button>
         ))}
      </div>
   </div>
);

const Textarea = ({ label, value, onChange }) => (
   <div className="space-y-3">
      <label className="text-sm font-bold text-slate-700 dark:text-gray-300 ml-1">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows="4" className="w-full bg-white border border-slate-200 rounded-[24px] p-6 text-slate-700 font-bold outline-none focus:border-teal-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none" />
   </div>
);

const ModelCard = ({ title, desc, checked, onClick, icon }) => (
   <div onClick={onClick} className={`p-8 rounded-[40px] border-2 cursor-pointer transition-all ${checked ? 'bg-white border-teal-500 shadow-2xl dark:bg-gray-900' : 'bg-slate-50 border-slate-100'}`}>
      <div className="flex justify-between items-center mb-4">
         <div className={`p-4 rounded-2xl ${checked ? 'bg-teal-50 text-teal-600' : 'bg-white text-slate-400'}`}>{icon}</div>
         <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${checked ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-200'}`}>{checked && <FiCheck />}</div>
      </div>
      <h4 className={`text-xl font-black mb-1 ${checked ? 'text-slate-900' : 'text-slate-500'}`}>{title}</h4>
      <p className="text-slate-400 text-sm font-medium">{desc}</p>
   </div>
);

const MapPicker = ({ latitude, longitude, onChange }) => {
   const [searchQuery, setSearchQuery] = useState("");
   const [suggestions, setSuggestions] = useState([]);
   const [isSearching, setIsSearching] = useState(false);
   const [mapInstance, setMapInstance] = useState(null);
   const [markerInstance, setMarkerInstance] = useState(null);
   const [mapType, setMapType] = useState("street"); // street or satellite
   const mapRef = React.useRef(null);
   const debounceTimer = React.useRef(null);

   useEffect(() => {
      // Load Leaflet dynamically
      if (!window.L) {
         const link = document.createElement('link');
         link.rel = 'stylesheet';
         link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
         document.head.appendChild(link);

         const script = document.createElement('script');
         script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
         script.onload = initMap;
         document.head.appendChild(script);
      } else {
         initMap();
      }

      function initMap() {
         if (mapInstance) return;

         const L = window.L;
         const initialLat = parseFloat(latitude) || 28.6139;
         const initialLng = parseFloat(longitude) || 77.2090;

         const map = L.map(mapRef.current, {
            center: [initialLat, initialLng],
            zoom: 13,
            zoomControl: false,
         });

         const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
         }).addTo(map);

         const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles © Esri'
         });

         L.control.zoom({ position: 'bottomright' }).addTo(map);

         const customIcon = L.icon({
            iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
         });

         const marker = L.marker([initialLat, initialLng], { 
            draggable: true,
            icon: customIcon
         }).addTo(map);

         marker.on('dragend', function (event) {
            const marker = event.target;
            const position = marker.getLatLng();
            onChange(position.lat.toFixed(6), position.lng.toFixed(6));
         });

         map.on('click', function (e) {
            marker.setLatLng(e.latlng);
            onChange(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
         });

         setMapInstance(map);
         setMarkerInstance(marker);
         map.streetLayer = streetLayer;
         map.satelliteLayer = satelliteLayer;
      }
   }, []);

   const handleTypeChange = (type) => {
      setMapType(type);
      if (type === "satellite") {
         mapInstance.removeLayer(mapInstance.streetLayer);
         mapInstance.satelliteLayer.addTo(mapInstance);
      } else {
         mapInstance.removeLayer(mapInstance.satelliteLayer);
         mapInstance.streetLayer.addTo(mapInstance);
      }
   };

   const fetchSuggestions = (query) => {
      if (!query || query.length < 3) {
         setSuggestions([]);
         return;
      }
      
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      
      debounceTimer.current = setTimeout(async () => {
         setIsSearching(true);
         try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}+India&limit=5`);
            const data = await res.json();
            setSuggestions(data || []);
         } catch (err) {
            console.error(err);
         } finally {
            setIsSearching(false);
         }
      }, 500);
   };

   const selectLocation = (loc) => {
      const newLat = parseFloat(loc.lat);
      const newLng = parseFloat(loc.lon);
      mapInstance.setView([newLat, newLng], 16);
      markerInstance.setLatLng([newLat, newLng]);
      onChange(newLat.toFixed(6), newLng.toFixed(6));
      setSearchQuery(loc.display_name);
      setSuggestions([]);
   };

   return (
      <div className="relative h-[550px] rounded-[56px] overflow-hidden border-[12px] border-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] group transition-all duration-700 dark:border-gray-800">
         <div ref={mapRef} className="w-full h-full z-0" />
         
         {/* Map Type Toggle - SMALLER */}
         <div className="absolute top-8 left-8 flex bg-white/95 backdrop-blur-2xl p-1.5 rounded-[20px] shadow-xl border border-white/40 z-10 font-bold">
            <button 
               onClick={() => handleTypeChange("street")}
               className={`px-5 py-2 text-[10px] rounded-xl transition-all uppercase tracking-wider ${mapType === "street" ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-500 hover:text-teal-600'}`}
            >
               Road
            </button>
            <button 
               onClick={() => handleTypeChange("satellite")}
               className={`px-5 py-2 text-[10px] rounded-xl transition-all uppercase tracking-wider ${mapType === "satellite" ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-500 hover:text-teal-600'}`}
            >
               Satellite
            </button>
         </div>

         {/* Search & Autocomplete Container - SMALLER & RIGHT */}
         <div className="absolute top-8 right-8 w-[280px] lg:w-[320px] z-20">
            <div className="relative bg-white/95 backdrop-blur-2xl p-1.5 rounded-[22px] shadow-xl border border-white/40 flex gap-1.5">
               <div className="flex-1 relative flex items-center">
                  <FiSearch className={`absolute left-3.5 text-slate-400 text-xs ${isSearching ? 'animate-pulse text-teal-500' : ''}`} />
                  <input 
                     placeholder="Search India..." 
                     value={searchQuery}
                     onChange={(e) => {
                        setSearchQuery(e.target.value);
                        fetchSuggestions(e.target.value);
                     }}
                     className="w-full h-9 pl-10 pr-4 bg-slate-50 dark:bg-gray-800 rounded-xl text-xs font-bold outline-none border-none focus:ring-4 focus:ring-teal-500/10 transition-all text-left" 
                  />
               </div>
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
               <div className="mt-2 bg-white/98 backdrop-blur-3xl rounded-[32px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.4)] border border-white overflow-hidden animate-fadeIn pb-2">
                  <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suggestions</span>
                     <button onClick={() => setSuggestions([])} className="text-xs text-slate-400 hover:text-red-500 font-bold">Clear</button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                     {suggestions.map((loc, i) => (
                        <button 
                           key={i} 
                           onClick={() => selectLocation(loc)}
                           className="w-full p-5 text-left hover:bg-teal-50/50 transition-colors flex gap-4 items-start group border-b border-slate-50 last:border-0"
                        >
                           <div className="mt-1 p-2 bg-slate-50 rounded-lg group-hover:bg-teal-100 transition-colors">
                              <FiMapPin className="text-slate-400 group-hover:text-teal-600 w-4 h-4" />
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-800 line-clamp-1 group-hover:text-teal-700 transition-colors">{loc.display_name.split(',')[0]}</p>
                              <p className="text-[11px] font-bold text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">{loc.display_name}</p>
                           </div>
                        </button>
                     ))}
                  </div>
               </div>
            )}
         </div>

         {/* Coordinate Floating Badge - SMALLER */}
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-10 transition-all hover:scale-105 duration-500">
            <div className="flex items-center gap-2">
               <span className="text-[8px] uppercase font-black text-slate-500 tracking-widest">LAT</span>
               <span className="text-xs font-black text-white tabular-nums tracking-tighter">{latitude}</span>
            </div>
            <div className="w-[1px] h-3 bg-slate-800" />
            <div className="flex items-center gap-2">
               <span className="text-[8px] uppercase font-black text-slate-500 tracking-widest">LNG</span>
               <span className="text-xs font-black text-teal-400 tabular-nums tracking-tighter">{longitude}</span>
            </div>
         </div>
         
         {!window.L && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl flex items-center justify-center z-[100]">
               <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                     <div className="w-20 h-20 border-4 border-teal-100 rounded-full animate-pulse" />
                     <FiRefreshCw className="absolute inset-0 m-auto w-10 h-10 text-teal-600 animate-spin" />
                  </div>
                  <span className="font-black text-slate-800 text-xl tracking-tight">Deploying Satellite Intelligence...</span>
               </div>
            </div>
         )}
      </div>
   );
};

const FiPercent = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>;

export default BusinessSettings;
