"use client";

import { useState, useEffect } from "react";

type SellCategory = "all" | "books";

export default function SellerRegistrationStep2() {
  const [sellCategory, setSellCategory] = useState<SellCategory>("all");
  const [gstin, setGstin] = useState("");
  const [gstinVerified, setGstinVerified] = useState(false);
  const [gstinError, setGstinError] = useState(false);
  
  // Only Books specific fields
  const [panNumber, setPanNumber] = useState("");
  const [panVerified, setPanVerified] = useState(false);
  const [panError, setPanError] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [addressFileName, setAddressFileName] = useState("");
  
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [pickupArea, setPickupArea] = useState("");
  const [fullNameError, setFullNameError] = useState(false);
  const [signatureMode, setSignatureMode] = useState<"" | "draw" | "choose">("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Account Details
  const [accHolderName, setAccHolderName] = useState("");
  const [accNumber, setAccNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accType, setAccType] = useState<"savings" | "current">("savings");

  const [pageLoading, setPageLoading] = useState(true);

  const API_BASE_URL = "http://localhost:5000/api/sellers";

  // ── On mount: verify token, check if step 2 already done, pre-fill saved data ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/Login";
      return;
    }

    // Fetch current seller profile from server
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (!res.ok) {
          // Token invalid or expired
          localStorage.removeItem("token");
          localStorage.removeItem("seller");
          window.location.href = "/Login";
          return;
        }
        const data = await res.json();
        const seller = data.seller;

        // If step 2 already done, skip to dashboard
        if (seller && seller.registrationStep >= 2) {
          window.location.href = "/seller-dashboard";
          return;
        }

        // Pre-populate form with any previously saved partial data
        if (seller) {
          if (seller.category === "Only Books") setSellCategory("books");
          
          // All Categories fields
          if (seller.gstin) { setGstin(seller.gstin); setGstinVerified(true); }
          
          // Only Books fields
          if (seller.panNumber) { setPanNumber(seller.panNumber); setPanVerified(true); }
          if (seller.businessName) setBusinessName(seller.businessName);
          if (seller.businessAddress) setBusinessAddress(seller.businessAddress);
          if (seller.pincode) setPincode(seller.pincode);
          if (seller.addressFileName) setAddressFileName(seller.addressFileName);
          
          // Shop Details
          if (seller.shopDetails?.fullName)    setFullName(seller.shopDetails.fullName);
          if (seller.shopDetails?.displayName) setDisplayName(seller.shopDetails.displayName);
          if (seller.shopDetails?.description) setStoreDesc(seller.shopDetails.description);
          if (seller.shopDetails?.address)     setPickupArea(seller.shopDetails.address);
          
          // Account Details
          if (seller.accountDetails?.holderName) setAccHolderName(seller.accountDetails.holderName);
          if (seller.accountDetails?.accountNumber) setAccNumber(seller.accountDetails.accountNumber);
          if (seller.accountDetails?.bankName) setBankName(seller.accountDetails.bankName);
          if (seller.accountDetails?.ifscCode) setIfscCode(seller.accountDetails.ifscCode);
          if (seller.accountDetails?.accountType) setAccType(seller.accountDetails.accountType);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setPageLoading(false);
      }
    })();
  }, []);

  const handleVerifyGstin = () => {
    if (!gstin.trim()) { setGstinError(true); return; }
    setGstinError(false);
    setGstinVerified(true);
  };

  const handleVerifyPan = () => {
    if (!panNumber.trim()) { setPanError(true); return; }
    setPanError(false);
    setPanVerified(true);
  };

  const handleAddressFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAddressFile(file);
      setAddressFileName(file.name);
    }
  };

  // Shared save logic — returns true on success
  const saveStep2 = async (): Promise<boolean> => {
    setSaveError("");
    if (!fullName.trim()) { setFullNameError(true); return false; }
    setFullNameError(false);

    // Validate category-specific fields
    if (sellCategory === "all") {
      if (!gstin.trim()) { setGstinError(true); return false; }
      setGstinError(false);
    } else {
      if (!panNumber.trim()) { setPanError(true); return false; }
      setPanError(false);
      if (!businessName.trim()) { setSaveError("Please enter business name"); return false; }
      if (!businessAddress.trim()) { setSaveError("Please enter business address"); return false; }
      if (!pincode.trim()) { setSaveError("Please enter pincode"); return false; }
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/Login";
        return false;
      }

      const API_BASE_URL = "http://localhost:5000/api/sellers";
      const response = await fetch(`${API_BASE_URL}/registration-step2`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: sellCategory === "all" ? "All Categories" : "Only Books",
          gstin: sellCategory === "all" ? gstin : undefined,
          panNumber: sellCategory === "books" ? panNumber : undefined,
          businessName: sellCategory === "books" ? businessName : undefined,
          businessAddress: sellCategory === "books" ? businessAddress : undefined,
          pincode: sellCategory === "books" ? pincode : undefined,
          addressFileName: addressFileName || undefined,
          eSignature: "signature_placeholder",
          storeFullName: fullName,
          storeDisplayName: displayName,
          storeDescription: storeDesc,
          storeAddress: pickupArea,
          accountHolderName: accHolderName,
          accountNumber: accNumber,
          bankName: bankName,
          ifscCode: ifscCode,
          accountType: accType,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("✅ Registration step 2 saved for seller:", data.seller?.name);
        setSaved(true);
        // Update localStorage so stale data doesn't cause a re-redirect on next navigation
        try {
          const stored = localStorage.getItem("seller");
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.registrationStep = 2;
            localStorage.setItem("seller", JSON.stringify(parsed));
          }
        } catch (_) {}
        return true;
      } else {
        setSaveError(data.message || "Failed to save registration");
        return false;
      }
    } catch (error) {
      console.error("Error:", error);
      setSaveError("Network error. Please try again.");
      return false;
    }
  };

  // Save button — save then wait 2 s before going to dashboard
  const handleSave = async () => {
    const ok = await saveStep2();
    if (ok) {
      setTimeout(() => {
        window.location.href = "/seller-dashboard";
      }, 2000);
    }
  };

  // GO LIVE — save first, then redirect immediately
  const handleGoLive = async () => {
    const ok = await saveStep2();
    if (ok) {
      window.location.href = "/seller-dashboard";
    }
  };

  // Go to Listing — save first, then redirect
  const handleGoListing = async () => {
    const ok = await saveStep2();
    if (ok) {
      window.location.href = "/seller-dashboard/products";
    }
  };



  // Show a loading screen while checking profile from server
  if (pageLoading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#f5f7fa",
        fontFamily: "Inter, sans-serif", flexDirection: "column", gap: 16,
      }}>
        <div style={{
          width: 40, height: 40, border: "4px solid #e8ecf0",
          borderTop: "4px solid #1565C0", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: "#888", fontSize: 14 }}>Checking your account…</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .s2-root {
          min-height: 100vh;
          background: #f5f7fa;
          font-family: 'Inter', sans-serif;
          color: #1a1a2e;
        }

        /* ── TOP BAR ── */
        .topbar {
          background: #fff;
          border-bottom: 1px solid #e8ecf0;
          padding: 14px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .topbar-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .topbar-logo span {
          font-size: 20px;
          font-weight: 800;
          color: #222;
          letter-spacing: -0.5px;
        }
        .topbar-badge {
          background: #F5A623;
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }

        /* Steps indicator */
        .steps-bar {
          display: flex;
          align-items: center;
          gap: 0;
        }
        .step-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #aaa;
        }
        .step-item.done { color: #4caf50; }
        .step-item.active { color: #1565C0; }
        .step-circle {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          background: #e8ecf0;
          color: #aaa;
          flex-shrink: 0;
        }
        .step-circle.done { background: #4caf50; color: #fff; }
        .step-circle.active { background: #1565C0; color: #fff; }
        .step-connector {
          width: 40px;
          height: 2px;
          background: #e8ecf0;
          margin: 0 6px;
        }
        .step-connector.done { background: #4caf50; }

        /* ── PAGE BODY ── */
        .s2-body {
          max-width: 860px;
          margin: 32px auto;
          padding: 0 16px 60px;
        }

        /* Section card */
        .section-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e8ecf0;
          padding: 32px 36px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .section-divider {
          border: none;
          border-top: 1.5px solid #f0f0f0;
          margin: 28px 0;
        }

        .section-title {
          font-size: 17px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 20px;
        }

        .sub-label {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
        }

        /* Category picker */
        .cat-row {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .cat-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: 10px;
          border: 1.5px solid #dde3ea;
          background: #fff;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #444;
          transition: all 0.2s;
        }
        .cat-btn.selected {
          border-color: #1565C0;
          background: #f0f6ff;
          color: #1565C0;
        }
        .cat-btn svg { flex-shrink: 0; }

        /* Field */
        .field-wrap {
          margin-bottom: 16px;
        }
        .input-row {
          display: flex;
          align-items: center;
          border: 1.5px solid #dde3ea;
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
          transition: border-color 0.2s;
        }
        .input-row.error { border-color: #e53935; }
        .input-row:focus-within { border-color: #1565C0; box-shadow: 0 0 0 3px rgba(21,101,192,0.08); }
        .input-row input, .input-row textarea {
          flex: 1;
          border: none;
          outline: none;
          font-size: 14px;
          color: #222;
          padding: 13px 16px;
          background: transparent;
          font-family: 'Inter', sans-serif;
        }
        .input-row input::placeholder, .input-row textarea::placeholder { color: #b0b8c1; }
        .inline-action-btn {
          background: none;
          border: none;
          border-left: 1.5px solid #e8ecf0;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #1565C0;
          padding: 0 16px;
          height: 46px;
          white-space: nowrap;
          transition: background 0.15s;
        }
        .inline-action-btn:hover { background: #f0f6ff; }
        .inline-action-btn.verified { color: #4caf50; cursor: default; }

        .field-error {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #e53935;
          font-size: 13px;
          margin-top: 6px;
          font-weight: 500;
        }
        .field-note {
          font-size: 13px;
          color: #666;
          margin-top: 8px;
          font-weight: 500;
        }

        /* e-Signature row */
        .signature-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .sig-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 10px;
          border: 1.5px solid #dde3ea;
          background: #fff;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #1565C0;
          transition: all 0.2s;
        }
        .sig-btn:hover, .sig-btn.active {
          border-color: #1565C0;
          background: #f0f6ff;
        }
        .sig-or {
          font-size: 13px;
          font-weight: 600;
          color: #aaa;
        }

        /* Textarea standalone */
        .textarea-field {
          width: 100%;
          border: 1.5px solid #dde3ea;
          border-radius: 10px;
          padding: 13px 16px;
          font-size: 14px;
          color: #222;
          font-family: 'Inter', sans-serif;
          resize: vertical;
          min-height: 90px;
          outline: none;
          transition: border-color 0.2s;
        }
        .textarea-field:focus { border-color: #1565C0; box-shadow: 0 0 0 3px rgba(21,101,192,0.08); }
        .textarea-field::placeholder { color: #b0b8c1; }

        /* Info icon next to label */
        .label-with-info {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
        }
        .label-with-info span { font-size: 14px; font-weight: 600; color: #333; }

        /* Pickup box */
        .pickup-box {
          border: 1.5px solid #dde3ea;
          border-radius: 12px;
          padding: 18px 20px;
          background: #f9fbfc;
        }
        .pickup-box-title {
          font-size: 14px;
          font-weight: 700;
          color: #333;
          margin-bottom: 4px;
        }
        .pickup-box-sub {
          font-size: 12.5px;
          color: #999;
          margin-bottom: 14px;
        }
        .pickup-search-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .pickup-search {
          flex: 1;
          min-width: 200px;
          display: flex;
          align-items: center;
          border: 1.5px solid #dde3ea;
          border-radius: 8px;
          background: #fff;
          padding: 10px 14px;
          gap: 8px;
        }
        .pickup-search input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 13.5px;
          font-family: 'Inter', sans-serif;
          color: #333;
          background: transparent;
        }
        .pickup-search input::placeholder { color: #b0b8c1; }
        .pickup-or { font-size: 13px; color: #aaa; font-weight: 600; }
        .use-location-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 700;
          color: #1565C0;
          font-family: 'Inter', sans-serif;
          padding: 4px 0;
          transition: opacity 0.15s;
        }
        .use-location-btn:hover { opacity: 0.75; }

        /* Account Details Section */
        .account-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        @media (max-width: 768px) {
          .account-details-grid {
            grid-template-columns: 1fr;
          }
        }
        .acc-select {
          border: 1.5px solid #dde3ea;
          border-radius: 10px;
          padding: 13px 16px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: #222;
          background: #fff;
          cursor: pointer;
          transition: border-color 0.2s;
          height: 46px;
        }
        .acc-select:focus {
          outline: none;
          border-color: #1565C0;
          box-shadow: 0 0 0 3px rgba(21,101,192,0.08);
        }
        .account-type-group {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          margin-top: 8px;
        }
        .radio-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .radio-option input[type="radio"] {
          cursor: pointer;
          accent-color: #1565C0;
        }
        .radio-option label {
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #444;
        }

        /* Save btn */
        .save-btn {
          background: ${saved ? "#e8ecf0" : "#c5d8f5"};
          color: ${saved ? "#4caf50" : "#1565C0"};
          border: none;
          border-radius: 8px;
          padding: 11px 28px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 16px;
          transition: background 0.2s;
        }
        .save-btn:hover { background: #b0caf0; }

        /* ── Listing Section ── */
        .listing-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          gap: 16px;
          flex-wrap: wrap;
        }
        .listing-label {
          font-size: 14px;
          color: #444;
          font-weight: 500;
          flex: 1;
        }
        .listing-search {
          display: flex;
          align-items: center;
          border: 1.5px solid #dde3ea;
          border-radius: 20px;
          padding: 9px 16px;
          gap: 8px;
          background: #f5f7fa;
          min-width: 220px;
        }
        .listing-search input {
          border: none;
          outline: none;
          font-size: 13.5px;
          font-family: 'Inter', sans-serif;
          background: transparent;
          color: #444;
          width: 100%;
        }
        .listing-search input::placeholder { color: #b0b8c1; }
        .listing-action-btn {
          border: 1.5px solid #dde3ea;
          border-radius: 20px;
          background: #fff;
          padding: 9px 22px;
          font-size: 13.5px;
          font-weight: 600;
          color: #1565C0;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .listing-action-btn:hover { background: #f0f6ff; border-color: #1565C0; }
        .listing-or {
          font-size: 13px;
          font-weight: 700;
          color: #aaa;
          padding: 4px 0;
        }

        /* Dhamaka banner */
        .dhamaka-row {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-top: 16px;
          flex-wrap: wrap;
        }
        .dhamaka-badge {
          background: linear-gradient(135deg, #FFD700, #FFA500);
          border-radius: 12px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dhamaka-badge span {
          font-size: 14px;
          font-weight: 900;
          color: #7b2800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .dhamaka-stat {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #e06000;
          font-weight: 600;
        }
        .dhamaka-stat .icon-ring {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 2px solid #e06000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
          color: #e06000;
          flex-shrink: 0;
        }

        /* Bottom action buttons */
        .bottom-actions {
          display: flex;
          gap: 12px;
          margin-top: 28px;
          flex-wrap: wrap;
        }
        .go-live-btn {
          background: linear-gradient(135deg, #FFA500, #FF6B00);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 13px 28px;
          font-size: 14px;
          font-weight: 800;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 14px rgba(255,107,0,0.35);
          transition: all 0.2s;
        }
        .go-live-btn:hover { background: linear-gradient(135deg, #FF8C00, #e55c00); box-shadow: 0 6px 18px rgba(255,107,0,0.45); }
        .go-listing-btn {
          background: #fff;
          color: #1565C0;
          border: 1.5px solid #dde3ea;
          border-radius: 8px;
          padding: 13px 24px;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .go-listing-btn:hover { background: #f0f6ff; border-color: #1565C0; }

        .req { color: #e53935; }

        @media (max-width: 600px) {
          .section-card { padding: 24px 18px; }
          .s2-body { margin: 16px auto; }
          .topbar { padding: 12px 16px; }
        }
      `}</style>

      <div className="s2-root">
        {/* ── TOP BAR ── */}
        <header className="topbar">
          <div className="topbar-logo">
            <span>petoty</span>
            <span className="topbar-badge">Seller Center</span>
          </div>

          {/* Steps */}
          <div className="steps-bar">
            <div className="step-item done">
              <div className="step-circle done">✓</div>
              Account Info
            </div>
            <div className="step-connector done" />
            <div className="step-item active">
              <div className="step-circle active">2</div>
              Business Details
            </div>
            <div className="step-connector" />
            <div className="step-item">
              <div className="step-circle">3</div>
              Go Live
            </div>
          </div>
        </header>

        {/* ── BODY ── */}
        <div className="s2-body">

          {/* ─── SECTION 1: ID & Signature Verification ─── */}
          <div className="section-card">
            <h2 className="section-title">ID &amp; Signature Verification</h2>

            {/* What to sell */}
            <p className="sub-label">What are you looking to sell on Petoty?</p>
            <div className="cat-row">
              <button
                type="button"
                className={`cat-btn ${sellCategory === "all" ? "selected" : ""}`}
                onClick={() => setSellCategory("all")}
              >
                {/* Box icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L11 21.73a2 2 0 0 0 2 0l7-3.73A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
                All Categories
              </button>
              <button
                type="button"
                className={`cat-btn ${sellCategory === "books" ? "selected" : ""}`}
                onClick={() => setSellCategory("books")}
              >
                {/* Book icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <span>
                  Only Books<br />
                  <span style={{ fontWeight: 400, fontSize: 12, color: "#888" }}>(PAN is mandatory)</span>
                </span>
              </button>
            </div>

            {/* GSTIN - Only for All Categories */}
            {sellCategory === "all" && (
              <div className="field-wrap">
                <div className={`input-row ${gstinError ? "error" : ""}`}>
                  <input
                    type="text"
                    placeholder="Enter GSTIN *"
                    value={gstin}
                    onChange={(e) => { setGstin(e.target.value); setGstinError(false); setGstinVerified(false); }}
                    maxLength={15}
                  />
                  <button
                    type="button"
                    className={`inline-action-btn ${gstinVerified ? "verified" : ""}`}
                    onClick={handleVerifyGstin}
                  >
                    {gstinVerified ? "✓ Verified" : "Verify GSTIN"}
                  </button>
                </div>
                {gstinError && (
                  <p className="field-error">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#e53935"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    Please enter your GSTIN
                  </p>
                )}
                <p className="field-note">GSTIN is required to sell products on Petoty.</p>
              </div>
            )}

            {/* PAN & Business Details - Only for Only Books */}
            {sellCategory === "books" && (
              <>
                {/* PAN Number */}
                <div className="field-wrap">
                  <div className={`input-row ${panError ? "error" : ""}`}>
                    <input
                      type="text"
                      placeholder="Enter PAN Number *"
                      value={panNumber}
                      onChange={(e) => { setPanNumber(e.target.value.toUpperCase()); setPanError(false); setPanVerified(false); }}
                      maxLength={10}
                    />
                    <button
                      type="button"
                      className={`inline-action-btn ${panVerified ? "verified" : ""}`}
                      onClick={handleVerifyPan}
                    >
                      {panVerified ? "✓ Verified" : "Verify"}
                    </button>
                  </div>
                  {panError && (
                    <p className="field-error">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="#e53935"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                      Please enter your PAN
                    </p>
                  )}
                  <p className="field-note">PAN is required to sell books on Petoty.</p>
                </div>

                <p style={{ fontSize: 13, color: "#666", marginTop: 16, marginBottom: 16, fontWeight: 500 }}>
                  PAN &amp; Business Details are required to sell books on Petoty.
                </p>

                {/* Business Name */}
                <div className="field-wrap">
                  <div className="input-row">
                    <input
                      type="text"
                      placeholder="Enter Business Name *"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Business Address */}
                <div className="field-wrap">
                  <label style={{ fontSize: 13, color: "#666", fontWeight: 500, marginBottom: 8, display: "block" }}>
                    Enter Business Address *
                  </label>
                  <textarea
                    style={{
                      width: "100%",
                      border: "1.5px solid #dde3ea",
                      borderRadius: 10,
                      padding: "13px 16px",
                      fontFamily: "Inter, sans-serif",
                      fontSize: 14,
                      color: "#222",
                      minHeight: 100,
                      resize: "vertical",
                    }}
                    placeholder="Enter Business Address"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                  />
                </div>

                {/* Pincode */}
                <div className="field-wrap">
                  <div className="input-row">
                    <input
                      type="text"
                      placeholder="Enter Pincode *"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                </div>

                {/* Address File Upload */}
                <div className="field-wrap" style={{ marginTop: 24, marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: "#333", fontWeight: 600, marginBottom: 12 }}>
                    Upload your address as a single file *
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <label style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "9px 22px",
                      border: "1.5px solid #1565C0",
                      borderRadius: 8,
                      backgroundColor: "#f0f6ff",
                      color: "#1565C0",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      Upload
                      <input
                        type="file"
                        onChange={handleAddressFileChange}
                        style={{ display: "none" }}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </label>
                    <span style={{ fontSize: 13, color: "#999" }}>Max File Size: 20 MB</span>
                  </div>
                  {addressFileName && (
                    <p style={{ fontSize: 13, color: "#2e7d32", marginTop: 8 }}>✓ {addressFileName}</p>
                  )}
                  <p style={{ fontSize: 12, color: "#666", marginTop: 12, lineHeight: 1.5 }}>
                    <strong>Front and Back:</strong> Voter ID / Passport<br/>
                    <strong>Only Front:</strong> Electricity Bill / Telephone or Mobile Bill / Bank Passbook or Statement
                  </p>
                </div>
              </>
            )}

            <hr className="section-divider" />

            {/* e-Signature */}
            <p className="sub-label">Add Your e-Signature</p>
            <div className="signature-row">
              <button
                type="button"
                className={`sig-btn ${signatureMode === "draw" ? "active" : ""}`}
                onClick={() => setSignatureMode("draw")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                Draw your signature
              </button>
              <span className="sig-or">OR</span>
              <button
                type="button"
                className={`sig-btn ${signatureMode === "choose" ? "active" : ""}`}
                onClick={() => setSignatureMode("choose")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Choose your signature
              </button>
            </div>
            {signatureMode === "draw" && (
              <div style={{ marginTop: 16, border: "1.5px dashed #1565C0", borderRadius: 10, height: 100, background: "#f0f6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "#999", fontSize: 13 }}>Draw area — click and drag here</p>
              </div>
            )}
            {signatureMode === "choose" && (
              <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["Signature A", "Signature B", "Signature C"].map((s) => (
                  <div key={s} style={{ border: "1.5px solid #dde3ea", borderRadius: 8, padding: "10px 20px", fontStyle: "italic", fontSize: 16, color: "#333", cursor: "pointer", background: "#fff", fontFamily: "Georgia, serif" }}>
                    {s.replace("Signature ", "Style ")}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── SECTION 2: Store & Pickup Details ─── */}
          <div className="section-card">
            <h2 className="section-title">Store &amp; Pickup Details</h2>

            {/* Full Name */}
            <div className="field-wrap">
              <div className={`input-row ${fullNameError ? "error" : ""}`}>
                <input
                  type="text"
                  placeholder="Enter Your Full Name *"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setFullNameError(false); }}
                />
              </div>
              {fullNameError && (
                <p className="field-error">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#e53935"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  Please enter your full name
                </p>
              )}
            </div>

            {/* Display Name */}
            <div className="field-wrap" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="input-row" style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="Enter Display Name *"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              {/* Info icon */}
              <span title="This name will be shown to buyers on Petoty" style={{ cursor: "help", color: "#aaa", flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </span>
            </div>

            {/* Store Description */}
            <div className="field-wrap">
              <textarea
                className="textarea-field"
                placeholder="Enter Store Description"
                value={storeDesc}
                onChange={(e) => setStoreDesc(e.target.value)}
              />
            </div>

            {/* Pickup Address */}
            <div className="pickup-box">
              <p className="pickup-box-title">
                Add Pickup Address{" "}
                <span style={{ fontWeight: 400, fontSize: 12.5, color: "#999" }}>
                  Petoty executive will pickup your orders from this location
                </span>
              </p>
              <div className="pickup-search-row">
                <div className="pickup-search">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b0b8c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search your Pickup Area or Location"
                    value={pickupArea}
                    onChange={(e) => setPickupArea(e.target.value)}
                  />
                </div>
                <span className="pickup-or">or</span>
                <button type="button" className="use-location-btn">
                  Use Current Location
                </button>
              </div>
            </div>

            <button
              type="button"
              className="save-btn"
              onClick={handleSave}
              style={{ background: saved ? "#e8f5e9" : "#c5d8f5", color: saved ? "#2e7d32" : "#1565C0" }}
            >
              {saved ? "✓ Saved" : "Save"}
            </button>
          </div>

          {/* ─── SECTION 3: Account Details ─── */}
          <div className="section-card">
            <h2 className="section-title">Account Details</h2>
            <p className="sub-label">Bank Account Information</p>

            {/* Account Holder Name */}
            <div className="field-wrap">
              <div className="input-row">
                <input
                  type="text"
                  placeholder="Account Holder Full Name *"
                  value={accHolderName}
                  onChange={(e) => setAccHolderName(e.target.value)}
                />
              </div>
            </div>

            {/* Account Number & IFSC - Grid */}
            <div className="account-details-grid">
              <div className="field-wrap">
                <div className="input-row">
                  <input
                    type="text"
                    placeholder="Account Number *"
                    value={accNumber}
                    onChange={(e) => setAccNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="field-wrap">
                <div className="input-row">
                  <input
                    type="text"
                    placeholder="IFSC Code *"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    maxLength={11}
                  />
                </div>
              </div>
            </div>

            {/* Bank Name */}
            <div className="field-wrap">
              <div className="input-row">
                <input
                  type="text"
                  placeholder="Bank Name (e.g., HDFC Bank, ICICI Bank) *"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>
            </div>

            {/* Account Type */}
            <div className="field-wrap">
              <p style={{ fontSize: 13, color: "#666", marginBottom: 8, fontWeight: 500 }}>Account Type</p>
              <div className="account-type-group">
                <div className="radio-option">
                  <input
                    type="radio"
                    id="savings"
                    name="accountType"
                    value="savings"
                    checked={accType === "savings"}
                    onChange={(e) => setAccType(e.target.value as "savings" | "current")}
                  />
                  <label htmlFor="savings">Savings</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="current"
                    name="accountType"
                    value="current"
                    checked={accType === "current"}
                    onChange={(e) => setAccType(e.target.value as "savings" | "current")}
                  />
                  <label htmlFor="current">Current</label>
                </div>
              </div>
            </div>
          </div>

          {/* ─── SECTION 4: Listing & Stock Availability ─── */}
          <div className="section-card">
            <h2 className="section-title">Listing &amp; Stock Availability</h2>

            {/* Row 1 */}
            <div className="listing-row">
              <p className="listing-label">
                List products which are already available on Petoty
              </p>
              <div className="listing-search">
                <input type="text" placeholder="Search by Brand and Category" />
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b0b8c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
            </div>

            <p className="listing-or">OR</p>

            {/* Row 2 */}
            <div className="listing-row">
              <p className="listing-label">Have a new product?</p>
              <button type="button" className="listing-action-btn">
                List your own products
              </button>
            </div>

            <p className="listing-or">OR</p>

            {/* Row 3 */}
            <div className="listing-row">
              <p className="listing-label">Add products with high demand on Petoty.</p>
              <button type="button" className="listing-action-btn">
                Go to Featured Selection
              </button>
            </div>

            {/* Dhamaka row */}
            <div className="dhamaka-row">
              <div className="dhamaka-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#7b2800"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span>Featured Selection</span>
              </div>
              <div className="dhamaka-stat">
                <div className="icon-ring">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e06000" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
                Guaranteed views
              </div>
              <div className="dhamaka-stat">
                <div className="icon-ring" style={{ fontSize: 15, fontWeight: 900 }}>2x</div>
                Higher Conversion
              </div>
            </div>

            {/* Bottom buttons */}
            {saveError && (
              <div style={{ background: "#ffebee", border: "1px solid #f5a5a0", color: "#c62828", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginTop: 12 }}>
                {saveError}
              </div>
            )}
            <div className="bottom-actions">
              <button type="button" className="go-live-btn" onClick={handleGoLive}>
                GO LIVE NOW
              </button>
              <button
                type="button"
                className="go-listing-btn"
                onClick={handleGoListing}
              >
                Go to Listing
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
