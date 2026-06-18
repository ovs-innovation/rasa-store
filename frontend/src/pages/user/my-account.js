import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FiPlus, FiEdit } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { useQuery, useQueryClient } from "@tanstack/react-query";

//internal imports
import { getUserSession } from "@lib/auth";
import Dashboard from "@pages/user/dashboard";
import Error from "@components/form/Error";
import CustomerServices from "@services/CustomerServices";
import { setToken } from "@services/httpServices";
import { notifySuccess, notifyError } from "@utils/toast";
import { getDisplayEmail } from "@utils/profileAuth";

const MyAccount = () => {
  const userInfo = getUserSession();
  const userId = userInfo?._id || userInfo?.id || null;
  const queryClient = useQueryClient();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
    phone: "",
    addressType: "Home",
    isDefault: false
  });

  // ensure axios has token
  useEffect(() => {
    if (userInfo?.token) {
      setToken(userInfo.token);
    }
  }, [userInfo?.token]);

  const {
    data: customer,
    error: customerError,
    isLoading: customerLoading,
  } = useQuery({
    queryKey: ["customer", { id: userId }],
    queryFn: async () => await CustomerServices.getCustomerById(userId),
    enabled: !!userId,
  });

  const { data: shippingAddressesResponse, error, isLoading } = useQuery({
    queryKey: ["shippingAddress", { id: userId }],
    queryFn: async () =>
      await CustomerServices.getShippingAddress({
        userId: userId,
      }),
    enabled: !!userId,
  });

  // Normalize to array
  const shippingAddresses = Array.isArray(shippingAddressesResponse?.shippingAddress)
    ? shippingAddressesResponse.shippingAddress
    : shippingAddressesResponse?.shippingAddress
      ? [shippingAddressesResponse.shippingAddress]
      : [];

  const hasShippingAddress = shippingAddresses && shippingAddresses.length > 0;

  // Handle address form input changes
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm({
      ...addressForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Open modal for adding new address
  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      name: userInfo?.name || "",
      address: "",
      city: "",
      country: "",
      zipCode: "",
      phone: userInfo?.phone || "",
      addressType: "Home",
      isDefault: !hasShippingAddress
    });
    setShowAddressModal(true);
  };

  // Open modal for editing address
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      name: address.name || "",
      address: address.address || "",
      city: address.city || "",
      country: address.country || "",
      zipCode: address.zipCode || "",
      phone: address.phone || address.contact || "",
      addressType: address.addressType || "Home",
      isDefault: address.isDefault || false
    });
    setShowAddressModal(true);
  };

  // Handle address submission (add or update)
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!userId) {
        notifyError("User ID not found");
        return;
      }

      let response;
      if (editingAddress && editingAddress._id) {
        // Update existing address
        response = await CustomerServices.updateShippingAddress({
          userId: userId,
          shippingId: editingAddress._id,
          shippingAddressData: addressForm
        });
      } else {
        // Add new address
        response = await CustomerServices.addShippingAddress({
          userId: userId,
          shippingAddressData: addressForm
        });
      }

      if (response.success || response.message) {
        setShowAddressModal(false);
        setEditingAddress(null);
        setAddressForm({
          name: "",
          address: "",
          city: "",
          country: "",
          zipCode: "",
          phone: "",
          addressType: "Home",
          isDefault: false
        });
        queryClient.invalidateQueries({ queryKey: ["shippingAddress", { id: userId }] });
        notifySuccess(editingAddress ? "Address updated successfully" : "Address added successfully");
      } else {
        notifyError(response.message || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      notifyError(error?.response?.data?.message || error?.message || "Failed to save address");
    }
  };

  // Handle address deletion
  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await CustomerServices.deleteShippingAddress({
        userId: userId,
        shippingId: addressId
      });

      if (response.message || response.success) {
        queryClient.invalidateQueries({ queryKey: ["shippingAddress", { id: userId }] });
        notifySuccess("Address deleted successfully");
      } else {
        notifyError(response.message || "Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      notifyError(error?.response?.data?.message || error?.message || "Failed to delete address");
    }
  };

  // console.log("data", data?.shippingAddress);

  return (
    <Dashboard title="My Account" description="Manage your profile and shipping addresses">
      <div className="max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-gray-800">My Account</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your account details and delivery addresses.</p>
        </div>

        <div className="space-y-8">
          {/* User Profile Card - Premium Design */}
          <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            {/* Subtle Top Accent */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-store-400 to-store-600"></div>
            
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-store-500 rounded-full blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    {userInfo?.image ? (
                      <img
                        src={userInfo.image}
                        className="relative h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
                        alt={userInfo?.name}
                      />
                    ) : (
                      <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-store-50 text-store-600 text-4xl font-bold border-4 border-white shadow-md">
                        {userInfo?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                      <h2 className="text-2xl font-serif font-bold text-gray-800">
                        {userInfo?.name}
                      </h2>
                    </div>
                    <div className="space-y-1">
                      {(getDisplayEmail(userInfo) || getDisplayEmail(customer)) && (
                        <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 text-sm">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          {getDisplayEmail(userInfo) || getDisplayEmail(customer)}
                        </div>
                      )}
                      <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {userInfo?.phone}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Link
                  href="/user/update-profile"
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-store-500 text-store-600 text-sm font-bold rounded-2xl hover:bg-store-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <FiEdit className="w-4 h-4" />
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Shipping Addresses Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-store-500 rounded-xl text-white shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-gray-800">Delivery Addresses</h3>
                  <p className="text-xs text-gray-500 font-medium">Where would you like your orders delivered?</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddAddress}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-store-500 text-white px-5 py-2.5 rounded-xl hover:bg-store-600 transition-all text-sm font-bold shadow-md hover:shadow-lg"
              >
                <FiPlus size={18} /> Add New Address
              </button>
            </div>

            <div className="p-6">
              {!isLoading && error ? (
                <Error error={error} />
              ) : hasShippingAddress ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {shippingAddresses.map((address) => (
                    <div
                      key={address._id || address.id}
                      className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                        address.isDefault 
                          ? 'border-store-500 bg-store-50/10' 
                          : 'border-gray-100 hover:border-store-200 bg-white hover:shadow-md'
                      }`}
                    >
                      {address.isDefault && (
                        <div className="absolute -top-3 left-6 px-3 py-0.5 bg-store-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                          Default
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                          address.addressType === 'Home' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                          address.addressType === 'Work' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                          'bg-gray-50 text-gray-600 border-gray-100'
                        }`}>
                          {address.addressType || 'Home'}
                        </span>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleEditAddress(address)}
                            className="p-2 text-gray-400 hover:text-store-600 hover:bg-store-50 rounded-xl transition-all"
                            title="Edit address"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          {shippingAddresses.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(address._id || address.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete address"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-base font-bold text-gray-800">{address.name}</h4>
                        <p className="text-sm font-medium text-gray-500">{address.phone}</p>
                        <p className="text-sm text-gray-600 leading-relaxed pt-2 border-t border-gray-50 mt-3">
                          {address.address}, {address.city}, {address.country} - <span className="font-bold text-gray-800">{address.zipCode}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm text-store-200">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-800">No addresses saved yet</h4>
                  <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">Add your delivery addresses for a faster checkout experience.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[60] overflow-hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowAddressModal(false)}
          />
          
          {/* Modal Panel - Slide from right */}
          <div className="absolute inset-y-0 right-0 max-w-full w-full md:max-w-lg">
            <div className="h-full flex flex-col bg-white shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingAddress ? "Edit Shipping Address" : "Add Shipping Address"}
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition-colors"
                  onClick={() => {
                    setShowAddressModal(false);
                    setEditingAddress(null);
                    setAddressForm({
                      name: "",
                      address: "",
                      city: "",
                      country: "",
                      zipCode: "",
                      phone: "",
                      addressType: "Home",
                      isDefault: false
                    });
                  }}
                >
                  <IoClose className="h-6 w-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddressSubmit} className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={addressForm.name}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <textarea
                      name="address"
                      value={addressForm.address}
                      onChange={handleAddressChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                      placeholder="123 Main St, Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                        placeholder="New York"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={addressForm.country}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                        placeholder="NY"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={addressForm.zipCode}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                      placeholder="10001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={addressForm.phone}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Type
                      </label>
                      <select
                        name="addressType"
                        value={addressForm.addressType}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                      >
                        <option value="Home">Home</option>
                        <option value="Work">Work</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-7">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={addressForm.isDefault}
                        onChange={handleAddressChange}
                        className="h-4 w-4 text-store-600 focus:ring-store-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Set as default address
                      </label>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-6 flex space-x-3">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-store-500"
                    onClick={() => setShowAddressModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-store-500 hover:bg-store-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-store-500"
                  >
                    {editingAddress ? "Update Address" : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Dashboard>
  );
};

export default MyAccount;
