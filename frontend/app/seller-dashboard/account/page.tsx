"use client";

import React, { useState, useEffect } from "react";
import { useSeller } from "../SellerContext";
import { Save, Upload } from "lucide-react";

export default function AccountPage() {
  const { seller, loading, refreshData } = useSeller();
  
  const [formData, setFormData] = useState({
    // Personal
    name: "",
    email: "",
    phone: "",
    // Store Details
    displayName: "",
    address: "",
    description: "",
    // Category-specific
    category: "All Categories",
    gstin: "",
    panNumber: "",
    businessName: "",
    businessAddress: "",
    pincode: "",
    // Account Details
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    ifscCode: "",
    accountType: "savings",
  });
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (seller) {
      console.log('[DEBUG] Account page - seller data received:', seller);
      setFormData({
        // Personal
        name: seller.name || "",
        email: seller.email || "",
        phone: seller.phone || "",
        // Store Details
        displayName: seller.shopDetails?.displayName || "",
        address: seller.shopDetails?.address || "",
        description: seller.shopDetails?.description || "",
        // Category-specific
        category: seller.category || "All Categories",
        gstin: seller.gstin || "",
        panNumber: seller.panNumber || "",
        businessName: seller.businessName || "",
        businessAddress: seller.businessAddress || "",
        pincode: seller.pincode || "",
        // Account Details
        accountHolderName: seller.accountDetails?.holderName || "",
        accountNumber: seller.accountDetails?.accountNumber || "",
        bankName: seller.accountDetails?.bankName || "",
        ifscCode: seller.accountDetails?.ifscCode || "",
        accountType: seller.accountDetails?.accountType || "savings",
      });
      if (seller.documents && seller.documents.length > 0) {
        setDocumentUrl(seller.documents[seller.documents.length - 1]);
      }
    } else {
      console.log('[DEBUG] Account page - seller data is empty');
    }
  }, [seller]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const data = new FormData();
    data.append("document", file);

    try {
      setUploading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/upload`, {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Upload failed");

      const result = await res.json();
      setDocumentUrl(result.filePath);
      setMessage({ type: "success", text: "File uploaded successfully." });
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to upload file." });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("sellerToken");

      const payload = {
        name: formData.name,
        displayName: formData.displayName,
        phone: formData.phone,
        shopAddress: formData.address,
        shopDescription: formData.description,
        category: formData.category,
        gstin: formData.category === "All Categories" ? formData.gstin : undefined,
        panNumber: formData.category === "Only Books" ? formData.panNumber : undefined,
        businessName: formData.businessName,
        businessAddress: formData.businessAddress,
        pincode: formData.pincode,
        accountHolderName: formData.accountHolderName,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
        ifscCode: formData.ifscCode,
        accountType: formData.accountType,
        documents: documentUrl ? [documentUrl] : [],
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/sellers/account`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to update account details");
      }

      await refreshData();
      setMessage({ type: "success", text: "Account details updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An error occurred" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">No seller data found. Please login again.</p>
          <button onClick={() => refreshData()} className="px-4 py-2 bg-burgundy text-white rounded-md">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-serif text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">Manage your personal and store information.</p>
        </div>
        <button 
          onClick={refreshData} 
          className="px-4 py-2 text-sm font-medium text-burgundy bg-burgundy/10 rounded-md hover:bg-burgundy/20 transition-colors"
          title="Refresh your account data from the server"
        >
          🔄 Refresh
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <div className="px-4 py-6 sm:p-8 space-y-8">
          
          {/* Personal Info Section */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 border-b border-gray-200 pb-8">
            <div className="sm:col-span-6">
              <h2 className="text-lg font-semibold leading-7 text-gray-900">Personal Information</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">Update your contact details.</p>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Full Name</label>
              <div className="mt-2">
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3" />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email Address</label>
              <div className="mt-2">
                <input type="email" name="email" id="email" disabled value={formData.email} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-500 bg-gray-50 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6 px-3 cursor-not-allowed" />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">Phone Number</label>
              <div className="mt-2">
                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3" />
              </div>
            </div>
          </div>

          {/* Store Info Section */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 border-b border-gray-200 pb-8">
            <div className="sm:col-span-6">
              <h2 className="text-lg font-semibold leading-7 text-gray-900">Store Details</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">Information visible to customers.</p>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="displayName" className="block text-sm font-medium leading-6 text-gray-900">Store Display Name</label>
              <div className="mt-2">
                <input type="text" name="displayName" id="displayName" value={formData.displayName} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3" />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">Store Description</label>
              <div className="mt-2">
                <textarea id="description" name="description" rows={3} value={formData.description} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3"></textarea>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">Store Pickup Address</label>
              <div className="mt-2">
                <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3" />
              </div>
            </div>
          </div>

          {/* Business Details Section */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 border-b border-gray-200 pb-8">
            <div className="sm:col-span-6">
              <h2 className="text-lg font-semibold leading-7 text-gray-900">Business Details</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">Category: <span className="font-medium text-gray-900">{formData.category}</span></p>
            </div>

            {/* GSTIN - Only for All Categories */}
            {formData.category === "All Categories" && (
              <div className="sm:col-span-4">
                <label htmlFor="gstin" className="block text-sm font-medium leading-6 text-gray-900">GST Number</label>
                <div className="mt-2">
                  <input type="text" name="gstin" id="gstin" value={formData.gstin} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3 uppercase" placeholder="e.g. 22AAAAA0000A1Z5" />
                </div>
              </div>
            )}

            {/* PAN & Business Details - Only for Only Books */}
            {formData.category === "Only Books" && (
              <>
                <div className="sm:col-span-3">
                  <label htmlFor="panNumber" className="block text-sm font-medium leading-6 text-gray-900">PAN Number</label>
                  <div className="mt-2">
                    <input type="text" name="panNumber" id="panNumber" value={formData.panNumber} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3 uppercase" maxLength={10 as any} />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="businessName" className="block text-sm font-medium leading-6 text-gray-900">Business Name</label>
                  <div className="mt-2">
                    <input type="text" name="businessName" id="businessName" value={formData.businessName} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3" />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="businessAddress" className="block text-sm font-medium leading-6 text-gray-900">Business Address</label>
                  <div className="mt-2">
                    <textarea id="businessAddress" name="businessAddress" rows={2} value={formData.businessAddress} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3"></textarea>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="pincode" className="block text-sm font-medium leading-6 text-gray-900">Pincode</label>
                  <div className="mt-2">
                    <input type="text" name="pincode" id="pincode" value={formData.pincode} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3" maxLength={6 as any} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Account Details Section */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 border-b border-gray-200 pb-8">
            <div className="sm:col-span-6">
              <h2 className="text-lg font-semibold leading-7 text-gray-900">Account Details</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">Bank account information for payments.</p>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="accountHolderName" className="block text-sm font-medium leading-6 text-gray-900">Account Holder Name</label>
              <div className="mt-2">
                <input type="text" name="accountHolderName" id="accountHolderName" value={formData.accountHolderName} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3" />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="accountNumber" className="block text-sm font-medium leading-6 text-gray-900">Account Number</label>
              <div className="mt-2">
                <input type="text" name="accountNumber" id="accountNumber" value={formData.accountNumber} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3" />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="ifscCode" className="block text-sm font-medium leading-6 text-gray-900">IFSC Code</label>
              <div className="mt-2">
                <input type="text" name="ifscCode" id="ifscCode" value={formData.ifscCode} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3 uppercase" maxLength={11 as any} />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="bankName" className="block text-sm font-medium leading-6 text-gray-900">Bank Name</label>
              <div className="mt-2">
                <input type="text" name="bankName" id="bankName" value={formData.bankName} onChange={handleChange} className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-burgundy sm:text-sm sm:leading-6 px-3" placeholder="e.g. HDFC Bank, ICICI Bank" />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">Account Type</label>
              <div className="mt-2 flex gap-4">
                <div className="flex items-center">
                  <input id="savings" name="accountType" type="radio" value="savings" checked={formData.accountType === "savings"} onChange={handleChange} className="h-4 w-4 border-gray-300 text-burgundy focus:ring-burgundy" />
                  <label htmlFor="savings" className="ml-3 block text-sm font-medium leading-6 text-gray-900">Savings</label>
                </div>
                <div className="flex items-center">
                  <input id="current" name="accountType" type="radio" value="current" checked={formData.accountType === "current"} onChange={handleChange} className="h-4 w-4 border-gray-300 text-burgundy focus:ring-burgundy" />
                  <label htmlFor="current" className="ml-3 block text-sm font-medium leading-6 text-gray-900">Current</label>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <h2 className="text-lg font-semibold leading-7 text-gray-900">Documents</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">Upload verification documents.</p>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium leading-6 text-gray-900">Verification Document</label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 transition-colors hover:bg-gray-50">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                  <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-burgundy focus-within:outline-none focus-within:ring-2 focus-within:ring-burgundy focus-within:ring-offset-2 hover:text-burgundy/80">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileUpload} accept="image/*,.pdf" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">PNG, JPG, PDF up to 10MB</p>
                  
                  {uploading && <p className="text-sm mt-3 text-blue-600 font-medium animate-pulse">Uploading...</p>}
                  
                  {documentUrl && !uploading && (
                     <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-100 flex items-center justify-between">
                       <span className="text-sm text-green-800 truncate px-2">Document attached</span>
                       <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${documentUrl}`} target="_blank" rel="noopener noreferrer" className="text-sm text-burgundy font-medium hover:underline">
                         View File
                       </a>
                     </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8 bg-gray-50">
          <button type="button" onClick={() => refreshData()} className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700">
            Reset
          </button>
          <button type="submit" disabled={saving || uploading} className="rounded-md bg-burgundy px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-burgundy/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
