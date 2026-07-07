import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FiPlus, FiEdit } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { useQuery, useQueryClient } from "@tanstack/react-query";

//internal imports
import { getUserSession } from "@lib/auth";
import UserDashboardLayout from "@components/user/UserDashboardLayout";
import Error from "@components/form/Error";
import CustomerServices from "@services/CustomerServices";
import { setToken } from "@services/httpServices";
import { notifySuccess, notifyError } from "@utils/toast";
import { getDisplayEmail } from "@utils/profileAuth";
import { UD } from "@components/user/userDashboardTheme";
import withNoSsr from "@utils/withNoSsr";

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
    <UserDashboardLayout title="My Account" description="Manage your profile and addresses">
      <div className="space-y-5 max-w-3xl">
        <div>
          <h1 className={UD.pageTitle}>My Account</h1>
          <p className={UD.pageSubtitle}>Profile and delivery addresses</p>
        </div>

        <div className={UD.panelPad}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#D4AF37] text-xl font-bold overflow-hidden">
                {userInfo?.image ? (
                  <img src={userInfo.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  userInfo?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">{userInfo?.name}</h2>
                {(getDisplayEmail(userInfo) || getDisplayEmail(customer)) && (
                  <p className="text-sm text-neutral-400">{getDisplayEmail(userInfo) || getDisplayEmail(customer)}</p>
                )}
                {userInfo?.phone && <p className="text-sm text-neutral-500">{userInfo.phone}</p>}
              </div>
            </div>
            <Link href="/user/update-profile" className={UD.btnSecondary}>
              <FiEdit className="w-4 h-4" /> Edit Profile
            </Link>
          </div>
        </div>

        <div className={UD.panelPad}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h3 className={UD.sectionTitle}>Delivery Addresses</h3>
            <button type="button" onClick={handleAddAddress} className={UD.btnPrimary}>
              <FiPlus size={16} /> Add Address
            </button>
          </div>

          {!isLoading && error ? (
            <Error error={error} />
          ) : hasShippingAddress ? (
            <div className="space-y-3">
              {shippingAddresses.map((address) => (
                <div
                  key={address._id || address.id}
                  className={`p-4 rounded-lg border ${
                    address.isDefault ? "border-[#D4AF37]/30 bg-[#D4AF37]/5" : "border-neutral-800"
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{address.name}</span>
                        {address.isDefault && (
                          <span className="text-[10px] uppercase tracking-wide text-[#D4AF37]">Default</span>
                        )}
                        <span className="text-xs text-neutral-500">{address.addressType || "Home"}</span>
                      </div>
                      <p className="text-sm text-neutral-400">{address.phone}</p>
                      <p className="text-sm text-neutral-300 mt-2">
                        {address.address}, {address.city}, {address.country} - {address.zipCode}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditAddress(address)}
                        className={UD.btnGhost}
                      >
                        Edit
                      </button>
                      {shippingAddresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(address._id || address.id)}
                          className={`${UD.btnGhost} text-red-400`}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={UD.empty}>No addresses saved yet</div>
          )}
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[60] overflow-hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddressModal(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md">
            <div className={`h-full flex flex-col ${UD.panel} border-l border-neutral-800`}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
                <h3 className="text-base font-medium text-white">
                  {editingAddress ? "Edit Address" : "Add Address"}
                </h3>
                <button type="button" onClick={() => setShowAddressModal(false)} className="text-neutral-400">
                  <IoClose className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddressSubmit} className="flex-1 overflow-y-auto px-5 py-4">
                <div className="space-y-4">
                  {[
                    { name: "name", label: "Full Name", type: "text" },
                    { name: "phone", label: "Phone", type: "tel" },
                    { name: "city", label: "City", type: "text" },
                    { name: "country", label: "State", type: "text" },
                    { name: "zipCode", label: "ZIP Code", type: "text" },
                  ].map(({ name, label, type }) => (
                    <div key={name}>
                      <label className={UD.label}>{label}</label>
                      <input
                        type={type}
                        name={name}
                        value={addressForm[name]}
                        onChange={handleAddressChange}
                        required
                        className={UD.input}
                      />
                    </div>
                  ))}
                  <div>
                    <label className={UD.label}>Street Address</label>
                    <textarea
                      name="address"
                      value={addressForm.address}
                      onChange={handleAddressChange}
                      required
                      rows={3}
                      className={UD.input}
                    />
                  </div>
                  <div>
                    <label className={UD.label}>Address Type</label>
                    <select
                      name="addressType"
                      value={addressForm.addressType}
                      onChange={handleAddressChange}
                      className={UD.input}
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-neutral-400">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={addressForm.isDefault}
                      onChange={handleAddressChange}
                      className="rounded border-neutral-700"
                    />
                    Set as default
                  </label>
                </div>
                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={() => setShowAddressModal(false)} className={`flex-1 ${UD.btnSecondary}`}>
                    Cancel
                  </button>
                  <button type="submit" className={`flex-1 ${UD.btnPrimary}`}>
                    {editingAddress ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </UserDashboardLayout>
  );
};

export default withNoSsr(MyAccount);
