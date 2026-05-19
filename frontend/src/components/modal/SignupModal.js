import React, { useState, useContext, useEffect } from "react";
import MainModal from "@components/modal/MainModal";
import { useForm } from "react-hook-form";
import { FiLock, FiMail, FiUser, FiCheckCircle, FiArrowRight, FiShield, FiEye, FiEyeOff } from "react-icons/fi";
import { IoPerson, IoBriefcase, IoClose, IoCheckmarkCircle, IoCloudUploadOutline, IoStorefront, IoDocumentText } from "react-icons/io5";
import { MdOutlineVerified, MdStorefront } from "react-icons/md";
import CustomerServices from "@services/CustomerServices";
import { notifyError, notifySuccess } from "@utils/toast";
import axios from "axios";
import InputArea from "@components/form/InputArea";
import Error from "@components/form/Error";
import Link from "next/link";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { UserContext } from "@context/UserContext";

/* ─────────────────────────────────────────────────────────────
   SHARED INNER CONTENT  (used by Page + Modal)
───────────────────────────────────────────────────────────── */
export const SignupContent = ({ onSuccess }) => {
    const [activeTab, setActiveTab] = useState("customer");
    const router = useRouter();
    const { dispatch } = useContext(UserContext);

    /* ── Wholesaler basic state ── */
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    /* ── "Have a shop?" section ── */
    const [hasShop, setHasShop] = useState(false);
    const [shopName, setShopName] = useState("");
    const [gstNumber, setGstNumber] = useState("");
    const [drugLicenseNumber, setDrugLicenseNumber] = useState("");

    /* ── File upload state ── */
    const [aadharFile, setAadharFile] = useState(null);
    const [panFile, setPanFile] = useState(null);
    const [shopImageFile, setShopImageFile] = useState(null);
    const [businessDocFile, setBusinessDocFile] = useState(null);

    const [aadharUrl, setAadharUrl] = useState("");
    const [panUrl, setPanUrl] = useState("");
    const [shopImageUrl, setShopImageUrl] = useState("");
    const [businessDocUrl, setBusinessDocUrl] = useState("");

    const [aadharPublicId, setAadharPublicId] = useState("");
    const [panPublicId, setPanPublicId] = useState("");
    const [shopImagePublicId, setShopImagePublicId] = useState("");
    const [businessDocPublicId, setBusinessDocPublicId] = useState("");

    const [aadharUploading, setAadharUploading] = useState(false);
    const [panUploading, setPanUploading] = useState(false);
    const [shopImageUploading, setShopImageUploading] = useState(false);
    const [businessDocUploading, setBusinessDocUploading] = useState(false);

    const [aadharPreview, setAadharPreview] = useState("");
    const [panPreview, setPanPreview] = useState("");
    const [shopImagePreview, setShopImagePreview] = useState("");
    const [businessDocPreview, setBusinessDocPreview] = useState("");

    const [aadharDeleteToken, setAadharDeleteToken] = useState("");
    const [panDeleteToken, setPanDeleteToken] = useState("");
    const [shopImageDeleteToken, setShopImageDeleteToken] = useState("");
    const [businessDocDeleteToken, setBusinessDocDeleteToken] = useState("");

    const [submitting, setSubmitting] = useState(false);

    /* ── Customer state ── */
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            agreeterm: false
        }
    });
    const [customerLoading, setCustomerLoading] = useState(false);

    /* ── Reset on mount and tab switch ── */
    useEffect(() => {
        // Stage 1: Immediate reset
        reset({ name: '', email: '', phone: '', password: '', agreeterm: false });
        resetWholesalerForm();

        // Stage 2: Delayed aggressive reset
        const timer = setTimeout(() => {
            reset({ name: '', email: '', phone: '', password: '', agreeterm: false });
            setValue("name", "");
            setValue("email", "");
            setValue("phone", "");
            setValue("password", "");
            resetWholesalerForm();
        }, 1000);
        return () => clearTimeout(timer);
    }, [reset, setValue, activeTab]);

    /* ── Helpers ── */
    const resetWholesalerForm = () => {
        setName(""); setEmail(""); setPhone("");
        setPassword(""); setConfirmPassword("");
        setHasShop(false); setShopName(""); setGstNumber(""); setDrugLicenseNumber("");
        setAadharFile(null); setPanFile(null); setShopImageFile(null); setBusinessDocFile(null);
        setAadharUrl(""); setPanUrl(""); setShopImageUrl(""); setBusinessDocUrl("");
        setAadharPreview(""); setPanPreview(""); setShopImagePreview(""); setBusinessDocPreview("");
        
        // Reset agreement checkbox
        const terms = document.getElementById("wholesaler-agree");
        if (terms) terms.checked = false;
    };

    const uploadToCloudinary = async (file, folder = "wholesaler") => {
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || !process.env.NEXT_PUBLIC_CLOUDINARY_URL) {
            notifyError("Cloudinary is not configured.");
            throw new Error("Cloudinary not configured");
        }
        const formData = new FormData();
        formData.append("file", file);
        const publicIdCandidate = `${file.name.replace(/\.[^/.]+$/, "")}__${Date.now()}`;
        formData.append("public_id", publicIdCandidate);
        formData.append("folder", folder);
        try {
            const signRes = await axios.post(`/api/customer/cloudinary-sign`, { publicId: publicIdCandidate, folder });
            if (signRes?.data?.signature) {
                const { signature, timestamp, apiKey } = signRes.data;
                formData.append("timestamp", timestamp);
                formData.append("api_key", apiKey);
                formData.append("signature", signature);
                formData.append("return_delete_token", "true");
            }
        } catch {
            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        }
        const cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL.replace("/image/upload", "/auto/upload");
        const res = await axios.post(cloudinaryUrl, formData, { headers: { "Content-Type": "multipart/form-data" } });
        return { url: res.data.secure_url, publicId: res.data.public_id, deleteToken: res.data.delete_token || null };
    };

    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (file) handleUpload(file, type);
    };

    const handleUpload = async (file, type) => {
        const uploaders = {
            aadhar: { setUploading: setAadharUploading, setPreview: setAadharPreview, setUrl: setAadharUrl, setPublicId: setAadharPublicId, setDeleteToken: setAadharDeleteToken, setFile: setAadharFile },
            pan: { setUploading: setPanUploading, setPreview: setPanPreview, setUrl: setPanUrl, setPublicId: setPanPublicId, setDeleteToken: setPanDeleteToken, setFile: setPanFile },
            shopImage: { setUploading: setShopImageUploading, setPreview: setShopImagePreview, setUrl: setShopImageUrl, setPublicId: setShopImagePublicId, setDeleteToken: setShopImageDeleteToken, setFile: setShopImageFile },
            businessDoc: { setUploading: setBusinessDocUploading, setPreview: setBusinessDocPreview, setUrl: setBusinessDocUrl, setPublicId: setBusinessDocPublicId, setDeleteToken: setBusinessDocDeleteToken, setFile: setBusinessDocFile },
        };
        const { setUploading, setPreview, setUrl, setPublicId, setDeleteToken, setFile } = uploaders[type];
        try {
            setUploading(true);
            let localPreview = null;
            if (file.type?.startsWith("image/")) {
                localPreview = URL.createObjectURL(file);
                setPreview(localPreview);
            }
            const { url, publicId, deleteToken } = await uploadToCloudinary(file);
            setUrl(url);
            setPublicId(publicId);
            setDeleteToken(deleteToken || "");
            setFile(file);
            if (!localPreview) setPreview(url);
        } catch {
            notifyError("File upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleWholesalerSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email) return notifyError("Name and Email are required");
        if (!password) return notifyError("Password is required");
        if (password.length < 8) return notifyError("Password must be at least 8 characters");
        if (password !== confirmPassword) return notifyError("Passwords do not match");

        /* Shop validation */
        if (hasShop) {
            if (!shopName) return notifyError("Business/Shop Name is required");
            if (!shopImageUrl) return notifyError("Please upload your Business/Shop Image");
            if (!drugLicenseNumber) return notifyError("Drug License Number is mandatory for pharma businesses");
        }

        const terms = document.getElementById("wholesaler-agree");
        if (terms && !terms.checked) return notifyError("You must agree to the Terms & Conditions");

        const payload = {
            name, email, phone, password,
            hasShop,
            shopName: hasShop ? shopName : null,
            gstNumber: hasShop ? (gstNumber || null) : null,
            drugLicenseNumber: hasShop ? drugLicenseNumber : null,
            shopImageUrl: hasShop ? shopImageUrl : null,
            shopImagePublicId: hasShop ? shopImagePublicId : null,
            shopImageDeleteToken: hasShop ? shopImageDeleteToken : null,
            businessDocUrl: hasShop ? (businessDocUrl || null) : null,
            businessDocPublicId: hasShop ? businessDocPublicId : null,
            businessDocDeleteToken: hasShop ? businessDocDeleteToken : null,
            aadharUrl: aadharUrl || null,
            panUrl: panUrl || null,
            aadharPublicId, panPublicId,
            aadharDeleteToken, panDeleteToken,};
        try {
            setSubmitting(true);
            const res = await CustomerServices.createWholesaler(payload);
            notifySuccess(res.message || "Submitted successfully! We will verify your account shortly.");
            resetWholesalerForm();
            if (onSuccess) onSuccess();
        } catch (err) {
            notifyError(err?.response?.data?.message || "Submission failed");
        } finally {
            setSubmitting(false);  } 
        };

    const handleCustomerSubmit = async ({ name, email, phone, password }) => {
        setCustomerLoading(true);
        try {
            const res = await CustomerServices.registerUser({ name, email, phone, password });
            if (res) {
                if (res.requiresVerification) {
                    notifySuccess(res.message);
                    reset();
                    router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
                } else {
                    const userInfo = {
                        _id: res._id,
                        name: res.name,
                        email: res.email,
                        phone: res.phone || "",
                        address: res.address || "",
                        image: res.image || "",
                        token: res.token,
                        role: res.role || "customer",
                    };
                    Cookies.set("userInfo", JSON.stringify(userInfo), { expires: 1 });
                    if (dispatch) dispatch({ type: "USER_LOGIN", payload: userInfo });
                    notifySuccess("Account created successfully!");
                    reset();
                    if (onSuccess) onSuccess();
                    router.push("/");
                }
            }
        } catch (error) {
            notifyError(error?.response?.data?.message || error?.message);
        } finally {
            setCustomerLoading(false);
        }
    };

    /* ── Upload doc card ── */
    const DocUploadCard = ({ label, type, status, url, file, required, hint, accept = "image/*,.pdf", imageOnly = false }) => (
        <div className={`group relative rounded-2xl border-2 transition-all duration-300 overflow-hidden
            ${url
                ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50"
                : "border-dashed border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50/30"
            }`}
        >
            <div className="flex items-center gap-4 p-4">
                {/* Icon side */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all
                    ${url ? "bg-emerald-500" : "bg-white border-2 border-gray-200 group-hover:border-emerald-300"}`}>
                    {status ? (
                        <span className="h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    ) : url ? (
                        <IoCheckmarkCircle className="text-white text-2xl" />
                    ) : (
                        <IoCloudUploadOutline className="text-gray-400 text-xl group-hover:text-emerald-500 transition-colors" />
                    )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                        {status ? "Uploading…" : url ? (file?.name || "Uploaded ✓") : (hint || (imageOnly ? "JPG, PNG · Max 5MB" : "JPG, PNG or PDF · Max 5MB"))}
                    </p>
                </div>
                {/* Upload btn */}
                <label className={`cursor-pointer flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all
                    ${url
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : "bg-white border-2 border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600"
                    } ${status ? "opacity-50 pointer-events-none" : ""}`}>
                    {status ? "…" : url ? "Change" : "Upload"}
                    <input type="file" className="hidden" accept={accept} onChange={(e) => handleFileSelect(e, type)} />
                </label>
            </div>
            {/* Image preview thumbnail */}
            {url && file?.type?.startsWith("image/") && (
                <div className="px-4 pb-3">
                    <img src={url} alt="preview" className="h-16 rounded-lg object-cover border border-emerald-200" />
                </div>
            )}
        </div>
    );
    
    return (
        <div className="w-full">
            {/* ── Account Type Switcher ── */}
            {/* <div className="mb-8">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 text-center">
                    Choose Account Type
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab("customer")}
                        className={`relative group flex flex-col sm:flex-row items-center gap-3 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 text-left
                            ${activeTab === "customer"
                                ? "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-600 text-white shadow-xl shadow-blue-200"
                                : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:shadow-md"
                            }`}
                    >
                        <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all
                            ${activeTab === "customer" ? "bg-white/20" : "bg-blue-50"}`}>
                            <IoPerson className={`text-xl sm:text-2xl ${activeTab === "customer" ? "text-white" : "text-blue-600"}`} />
                        </div>
                        <div className="text-center sm:text-left">
                            <div className="font-bold text-sm sm:text-base leading-tight">Retail Customer</div>
                            <div className={`text-xs mt-0.5 hidden sm:block ${activeTab === "customer" ? "text-blue-100" : "text-gray-400"}`}>
                                Personal &amp; Family use
                            </div>
                        </div>
                        {activeTab === "customer" && (
                            <FiCheckCircle className="absolute top-3 right-3 text-white/80 text-sm" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("wholesaler")}
                        className={`relative group flex flex-col sm:flex-row items-center gap-3 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 text-left
                            ${activeTab === "wholesaler"
                                ? "bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-600 text-white shadow-xl shadow-emerald-200"
                                : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:shadow-md"
                            }`}
                    >
                        <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all
                            ${activeTab === "wholesaler" ? "bg-white/20" : "bg-emerald-50"}`}>
                            <IoBriefcase className={`text-xl sm:text-2xl ${activeTab === "wholesaler" ? "text-white" : "text-emerald-600"}`} />
                        </div>
                        <div className="text-center sm:text-left">
                            <div className="font-bold text-sm sm:text-base leading-tight">Wholesaler / B2B</div>
                            <div className={`text-xs mt-0.5 hidden sm:block ${activeTab === "wholesaler" ? "text-emerald-100" : "text-gray-400"}`}>
                                Pharmacies &amp; Clinics
                            </div>
                        </div>
                        {activeTab === "wholesaler" && (
                            <FiCheckCircle className="absolute top-3 right-3 text-white/80 text-sm" />
                        )}
                    </button>
                </div>
            </div> */}

            {/* ── CUSTOMER FORM ── */}
            {activeTab === "customer" && (
                <div className="space-y-5">
                    <form onSubmit={handleSubmit(handleCustomerSubmit)} className="space-y-5" autoComplete="off">
                        {/* Trap inputs to catch browser autofill */}
                        <input type="text" name="dummy-customer-email" style={{ display: 'none' }} tabIndex="-1" aria-hidden="true" />
                        <input type="password" name="dummy-customer-password" style={{ display: 'none' }} tabIndex="-1" aria-hidden="true" />
                        {/* Name */}
                        <div>
                            <InputArea
                                register={register}
                                label="Full Name"
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                Icon={FiUser}
                            />
                            <Error errorName={errors.name} />
                        </div>

                        {/* Email */}
                        <div>
                            <InputArea
                                register={register}
                                label="Email Address"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                Icon={FiMail}
                                autocomplete="new-email"
                            />
                            <Error errorName={errors.email} />
                        </div>

                        {/* Phone */}
                        <div>
                            <InputArea
                                register={register}
                                label="Phone Number"
                                name="phone"
                                type="tel"
                                placeholder="9876543210"
                                Icon={MdOutlineVerified}
                                required
                                pattern={/^[0-9]{10}$/}
                                patternMessage="Please enter a valid 10-digit number"
                                maxLength="10"
                                onInput={(e) => (e.target.value = e.target.value.replace(/\D/g, ""))}
                            />
                            <Error errorName={errors.phone} />
                        </div>

                        {/* Password */}
                        <div>
                            <InputArea
                                register={register}
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="Minimum 8 characters"
                                Icon={FiLock}
                                autocomplete="new-password"
                                pattern={/^.{8,}$/}
                                patternMessage="Password must be at least 8 characters."
                            />
                            <Error errorName={errors.password} />
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-3 bg-blue-50/60 rounded-xl px-4 py-3 border border-blue-100">
                            <input
                                type="checkbox"
                                id="customer-agree"
                                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                                {...register("agreeterm", { required: "You must agree to continue" })}
                            />
                            <label htmlFor="customer-agree" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                                I agree to FarmacyKart&apos;s{" "}
                                <Link href="/terms-and-conditions" className="text-blue-600 font-semibold hover:underline">
                                    Terms &amp; Conditions
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy-policy" className="text-blue-600 font-semibold hover:underline">
                                    Privacy Policy
                                </Link>
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                        </div>
                        <Error errorName={errors.agreeterm} />

                        {/* Submit */}
                        <button
                            disabled={customerLoading}
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold text-base
                                hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all duration-200
                                shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed
                                flex items-center justify-center gap-3"
                        >
                            {customerLoading ? (
                                <>
                                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                    Creating Account…
                                </>
                            ) : (
                                <>
                                    Create Free Account
                                    <FiArrowRight className="text-lg" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* ── WHOLESALER FORM ── */}
            {activeTab === "wholesaler" && (
                <div className="space-y-6">
                    <form onSubmit={handleWholesalerSubmit} className="space-y-6" autoComplete="off">
                        {/* Trap inputs to catch browser autofill */}
                        <input type="text" name="dummy-wholesaler-email" style={{ display: 'none' }} tabIndex="-1" aria-hidden="true" />
                        <input type="password" name="dummy-wholesaler-password" style={{ display: 'none' }} tabIndex="-1" aria-hidden="true" />

                        {/* ─── Section 1: Business Details ─── */}
                        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-100 space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <IoBriefcase className="text-emerald-600 text-sm" />
                                </div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    Basic Information
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Owner / Business Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Owner / Contact Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FiUser className="text-sm" />
                                        </span>
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm
                                                focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                            placeholder="e.g. Ramesh Kumar"
                                        />
                                    </div>
                                </div>

                                {/* Business Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Business Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FiMail className="text-sm" />
                                        </span>
                                        <input
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            type="email"
                                            autoComplete="off"
                                            className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm
                                                focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                            placeholder="name@business.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                                        +91
                                    </span>
                                    <input
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                                        maxLength="10"
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm
                                            focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        placeholder="9876543210"
                                    />
                                </div>
                            </div>

                            {/* Password Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FiLock className="text-sm" />
                                        </span>
                                        <input
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            className="w-full pl-9 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm
                                                focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                            placeholder="Min. 8 characters"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FiLock className="text-sm" />
                                        </span>
                                        <input
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            type={showConfirmPassword ? "text" : "password"}
                                            className={`w-full pl-9 pr-10 py-3 bg-white border rounded-xl text-sm
                                                focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all
                                                ${confirmPassword && password !== confirmPassword ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                                            placeholder="Re-enter password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                                        </button>
                                    </div>
                                    {confirmPassword && password !== confirmPassword && (
                                        <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                                    )}
                                    {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
                                        <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                                            <IoCheckmarkCircle className="text-sm" /> Passwords match
                                        </p>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                <FiLock className="text-emerald-400 flex-shrink-0" />
                                Use this email &amp; password to login to your wholesaler account.
                            </p>
                        </div>

                        {/* ─── Section 2: Shop / Individual Checkbox ─── */}
                        <div className={`rounded-2xl border-2 p-5 sm:p-6 transition-all duration-300
                            ${hasShop ? "border-emerald-400 bg-gradient-to-br from-emerald-50/60 to-teal-50/40" : "border-gray-200 bg-white"}`}>

                            {/* Checkbox Header */}
                            <label htmlFor="hasShopCheckbox" className="flex items-start gap-4 cursor-pointer">
                                <div className="relative flex-shrink-0 mt-0.5">
                                    <input
                                        type="checkbox"
                                        id="hasShopCheckbox"
                                        checked={hasShop}
                                        onChange={(e) => setHasShop(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                                        ${hasShop ? "bg-emerald-600 border-emerald-600" : "bg-white border-gray-300 hover:border-emerald-400"}`}>
                                        {hasShop && <IoCheckmarkCircle className="text-white text-base" />}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <MdStorefront className={`text-xl ${hasShop ? "text-emerald-600" : "text-gray-400"}`} />
                                        <p className={`font-bold text-sm sm:text-base ${hasShop ? "text-emerald-800" : "text-gray-700"}`}>
                                            Do you have a Shop / Business?
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Tick this if you are a pharmacy, medical store, clinic, or any registered business.
                                        Agar aap individual hain toh yeh check karne ki zaroorat nahi.
                                    </p>
                                </div>
                            </label>

                            {/* Shop Details — shown only when hasShop = true */}
                            {hasShop && (
                                <div className="mt-6 space-y-5 border-t border-emerald-200 pt-5">

                                    {/* Shop Image Upload (Mandatory) */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Business / Shop Image <span className="text-red-500">*</span>
                                        </label>
                                        <DocUploadCard
                                            label="Upload Shop / Store Photo"
                                            type="shopImage"
                                            status={shopImageUploading}
                                            url={shopImageUrl}
                                            file={shopImageFile}
                                            required
                                            hint="Clear front-facing photo of your shop"
                                            accept="image/*"
                                            imageOnly
                                        />
                                        {shopImageUrl && shopImagePreview && (
                                            <div className="mt-2 rounded-xl overflow-hidden border border-emerald-200">
                                                <img
                                                    src={shopImagePreview}
                                                    alt="Shop preview"
                                                    className="w-full h-40 object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Shop Name (Mandatory) */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Business / Shop Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                                <IoStorefront className="text-sm" />
                                            </span>
                                            <input
                                                value={shopName}
                                                onChange={(e) => setShopName(e.target.value)}
                                                className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm
                                                    focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                                placeholder="e.g. Sharma Medicals Pvt. Ltd."
                                            />
                                        </div>
                                    </div>

                                    {/* GST Number (Optional) + Drug License (Mandatory) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                GST Number{" "}
                                                <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                                    <MdOutlineVerified className="text-sm" />
                                                </span>
                                                <input
                                                    value={gstNumber}
                                                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                                                    maxLength={15}
                                                    className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm
                                                        focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                                    placeholder="22AAAAA0000A1Z5"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">Chhote dukandaar ke liye optional hai</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Drug License Number <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                                    <IoDocumentText className="text-sm" />
                                                </span>
                                                <input
                                                    value={drugLicenseNumber}
                                                    onChange={(e) => setDrugLicenseNumber(e.target.value)}
                                                    className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm
                                                        focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                                    placeholder="e.g. MH-1234-2025"
                                                />
                                            </div>
                                            <p className="text-xs text-red-400 mt-1">Pharma business ke liye mandatory hai</p>
                                        </div>
                                    </div>

                                    {/* Upload Document (Photo/PDF) */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Upload Business Document{" "}
                                            <span className="text-gray-400 font-normal text-xs">(Photo / PDF)</span>
                                        </label>
                                        <DocUploadCard
                                            label="GST Certificate / Drug License / Any Proof"
                                            type="businessDoc"
                                            status={businessDocUploading}
                                            url={businessDocUrl}
                                            file={businessDocFile}
                                            hint="Upload GST cert, drug license, or any business proof"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ─── Section 3: Identity Verification (Optional) ─── */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <FiShield className="text-amber-600 text-sm" />
                                </div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    Identity Documents
                                </h3>
                                <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <DocUploadCard
                                    label="Aadhar Card"
                                    type="aadhar"
                                    status={aadharUploading}
                                    url={aadharUrl}
                                    file={aadharFile}
                                    hint="Optional — for faster verification"
                                />
                                <DocUploadCard
                                    label="PAN Card"
                                    type="pan"
                                    status={panUploading}
                                    url={panUrl}
                                    file={panFile}
                                    hint="Optional — for faster verification" />
                            </div>

                            <p className="text-xs text-gray-400 flex items-center gap-1.5 px-1">
                                <FiShield className="text-emerald-400 flex-shrink-0" />
                                All documents are encrypted and stored securely. Aadhar &amp; PAN are optional but help speed up verification.
                            </p>
                        </div>

                        {/* Terms + Submit */}
                        <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100 space-y-4">
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="wholesaler-agree"
                                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer flex-shrink-0"
                                    required
                                />
                                <label htmlFor="wholesaler-agree" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                                    I agree to FarmacyKart&apos;s{" "}
                                    <Link href="/terms-and-conditions" className="text-emerald-600 font-semibold hover:underline">
                                        B2B Terms &amp; Conditions
                                    </Link>{" "}
                                    and authorise verification of the submitted documents.
                                </label>
                            </div>

                            <button
                                disabled={submitting}
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-base
                                    hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all duration-200
                                    shadow-lg shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed
                                    flex items-center justify-center gap-3">
                                {submitting ? (
                                    <>
                                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                        Submitting Request…
                                    </>
                                ) : (
                                    <>
                                        Submit Wholesale Request
                                        <FiArrowRight className="text-lg" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Footer ── */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-gray-500">Already have an account?</p>
                <Link href="/auth/login"
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-blue-600 font-bold border-2 border-blue-100
                        hover:bg-blue-50 hover:border-blue-300 rounded-xl transition-all text-sm">
                    Login to your account
                    <FiArrowRight className="text-sm" />
                </Link>
            </div>
        </div>
    );
};
/* ─────────────────────────────────────────────────────────────
    MODAL VERSION  (used from Navbar if needed later)
───────────────────────────────────────────────────────────── */
const SignupModal = ({ modalOpen, setModalOpen }) => {
    return (
        <MainModal modalOpen={modalOpen} setModalOpen={setModalOpen}>
            <div className="inline-block w-full max-w-2xl p-0 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-bl-full -z-10 opacity-60" />
                <div className="p-6 md:p-10">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
                            <p className="text-gray-500 text-sm mt-1">Start your journey with FarmacyKart.</p>
                        </div>
                        <button
                            onClick={() => setModalOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                            <IoClose size={22} />
                        </button>
                    </div>
                    <SignupContent onSuccess={() => setModalOpen(false)} />
                </div>
            </div>
        </MainModal>
    );
};
export default SignupModal;