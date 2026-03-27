"use client";

import { useState } from "react";

type Tab = "login" | "register";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("login");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [otpSentMobile, setOtpSentMobile] = useState(false);
  const [otpSentEmail, setOtpSentEmail] = useState(false);

  /* ── plain redirect — no backend ── */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = "/seller-dashboard";
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = "/seller-registration";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pg-root {
          min-height: 100vh;
          background: linear-gradient(180deg, #F4EFEB 0%, #C98BA8 50%, #A05A78 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px 16px;
          font-family: 'Inter', sans-serif;
        }

        /* ── CARD ── */
        .card {
          background: #fff;
          border-radius: 22px;
          width: 100%;
          max-width: 920px;
          display: flex;
          min-height: 520px;
          box-shadow: 0 24px 72px rgba(0,0,0,0.18);
          overflow: hidden;
          position: relative;
        }

        /* ══════════════════ LEFT PANEL ══════════════════ */
        .left {
          flex: 0 0 52%;
          padding: 48px 52px 40px;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #f2f2f2;
        }

        /* Logo */
        .logo-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 30px;
        }
        .logo-name {
          font-size: 21px;
          font-weight: 800;
          color: #222;
          letter-spacing: -0.5px;
        }
        .logo-badge {
          background: #F5A623;
          color: #fff;
          font-size: 9.5px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }

        /* Tabs */
        .tabs {
          display: flex;
          border-bottom: 1.5px solid #ececec;
          margin-bottom: 28px;
          gap: 4px;
        }
        .tab-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 14.5px;
          font-weight: 600;
          color: #aaa;
          padding: 0 0 12px;
          margin-right: 24px;
          position: relative;
          transition: color 0.2s;
        }
        .tab-btn.active { color: #222; }
        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1.5px;
          left: 0;
          right: 0;
          height: 2.5px;
          background: #2196F3;
          border-radius: 2px;
        }

        /* Heading */
        .form-head { margin-bottom: 22px; }
        .form-head h1 {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 3px;
        }
        .form-head p { font-size: 13px; color: #999; }

        /* Fields */
        .field-group { display: flex; flex-direction: column; gap: 13px; }

        .field {
          display: flex;
          align-items: center;
          border: 1.5px solid #dde3ea;
          border-radius: 10px;
          background: #fff;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field:focus-within {
          border-color: #2196F3;
          box-shadow: 0 0 0 3px rgba(33,150,243,0.08);
        }
        .field input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 13.5px;
          color: #222;
          padding: 13px 14px;
          background: transparent;
          font-family: 'Inter', sans-serif;
        }
        .field input::placeholder { color: #b0b8c1; }

        .req { color: #e53935; font-size: 12px; margin-left: 2px; }

        /* OTP button inside field */
        .otp-btn {
          background: none;
          border: none;
          border-left: 1.5px solid #dde3ea;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #2196F3;
          padding: 0 16px;
          height: 100%;
          min-height: 46px;
          white-space: nowrap;
          transition: background 0.15s, color 0.15s;
        }
        .otp-btn:hover { background: #f0f7ff; }
        .otp-btn.sent { color: #4caf50; }

        /* Eye toggle */
        .eye-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0 13px;
          color: #b0b8c1;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .eye-btn:hover { color: #555; }

        /* Label prefix */
        .label-prefix {
          font-size: 13.5px;
          color: #555;
          padding: 13px 0 13px 14px;
          white-space: nowrap;
          user-select: none;
        }

        /* Terms */
        .terms {
          font-size: 12.5px;
          color: #666;
          margin-top: 4px;
          line-height: 1.5;
        }
        .terms a {
          color: #2196F3;
          font-weight: 600;
          text-decoration: none;
        }
        .terms a:hover { text-decoration: underline; }

        /* Submit btn */
        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #1565C0;
          color: #fff;
          border: none;
          border-radius: 10px;
          height: 48px;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          letter-spacing: 0.2px;
          transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(21,101,192,0.35);
          margin-top: 4px;
        }
        .submit-btn:hover { background: #0d47a1; box-shadow: 0 6px 18px rgba(21,101,192,0.45); }
        .submit-btn:active { transform: scale(0.985); }

        .arrow-icon { font-size: 18px; }

        /* Footer note */
        .footer-note {
          margin-top: auto;
          padding-top: 20px;
          font-size: 11.5px;
          color: #bbb;
          text-align: center;
        }

        /* ══════════════════ RIGHT PANEL ══════════════════ */
        .right {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 36px;
          position: relative;
          overflow: hidden;
          background: #fafcfc;
        }

        .blob-bg {
          position: absolute;
          bottom: -50px;
          right: -70px;
          width: 360px;
          opacity: 0.08;
          pointer-events: none;
        }

        .illus-wrap {
          position: relative;
          z-index: 1;
          margin-bottom: 26px;
        }

        .grow-text { position: relative; z-index: 1; text-align: left; }
        .grow-text h2 {
          font-size: 30px;
          font-weight: 800;
          color: #1a1a1a;
          line-height: 1.2;
          margin-bottom: 10px;
        }
        .grow-text h2 .brand { color: #e8335a; }
        .grow-text .sub {
          font-size: 13px;
          color: #999;
        }
        .grow-text .sub a {
          color: #2196F3;
          font-weight: 600;
          text-decoration: none;
          border-bottom: 1px dashed #2196F3;
        }
        .grow-text .sub a:hover { color: #0d47a1; }

        /* Copyright */
        .copyright {
          position: absolute;
          bottom: 14px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 11px;
          color: #ccc;
        }

        /* Responsive */
        @media (max-width: 680px) {
          .card { flex-direction: column; }
          .left { flex: none; padding: 36px 28px 28px; border-right: none; border-bottom: 1px solid #f0f0f0; }
          .right { padding: 32px 28px; }
          .grow-text h2 { font-size: 24px; }
        }
      `}</style>

      <div className="pg-root">
        <div className="card">

          {/* ══ LEFT ══ */}
          <div className="left">
            {/* Logo */}
            <div className="logo-row">
              <span className="logo-name">petoty</span>
              <span className="logo-badge">Seller Center</span>
            </div>

            {/* Tabs */}
            <div className="tabs">
              <button
                className={`tab-btn ${tab === "login" ? "active" : ""}`}
                onClick={() => setTab("login")}
                type="button"
              >
                Login
              </button>
              <button
                className={`tab-btn ${tab === "register" ? "active" : ""}`}
                onClick={() => setTab("register")}
                type="button"
              >
                Register
              </button>
            </div>

            {/* ── LOGIN FORM ── */}
            {tab === "login" && (
              <form onSubmit={handleLogin}>
                <div className="form-head">
                  <h1>Welcome Back!</h1>
                  <p>Sign in using OTP sent to your mobile or email</p>
                </div>

                <div className="field-group">
                  {/* Mobile + OTP */}
                  <div className="field">
                    <span className="label-prefix">
                      Enter Mobile Number <span className="req">*</span>
                    </span>
                    <input
                      type="tel"
                      id="login-mobile"
                      placeholder=""
                      maxLength={10}
                    />
                    <button
                      type="button"
                      className={`otp-btn ${otpSentMobile ? "sent" : ""}`}
                      onClick={() => setOtpSentMobile(true)}
                    >
                      {otpSentMobile ? "OTP Sent ✓" : "Send OTP"}
                    </button>
                  </div>

                  {/* Email + OTP */}
                  <div className="field">
                    <span className="label-prefix">
                      Email ID <span className="req">*</span>
                    </span>
                    <input
                      type="email"
                      id="login-email"
                      placeholder=""
                    />
                    <button
                      type="button"
                      className={`otp-btn ${otpSentEmail ? "sent" : ""}`}
                      onClick={() => setOtpSentEmail(true)}
                    >
                      {otpSentEmail ? "OTP Sent ✓" : "Send OTP"}
                    </button>
                  </div>

                  <p className="terms">
                    By continuing, I agree to Petoty&apos;s{" "}
                    <a href="#">Terms of Use</a> &amp; <a href="#">Privacy Policy</a>
                  </p>

                  <button type="submit" className="submit-btn">
                    Login &amp; Continue <span className="arrow-icon">→</span>
                  </button>
                </div>

                <p className="footer-note">
                  Having trouble?{" "}
                  <a href="#" style={{ color: "#2196F3", fontWeight: 600 }}>
                    Reset Password
                  </a>
                </p>
              </form>
            )}

            {/* ── REGISTER FORM ── */}
            {tab === "register" && (
              <form onSubmit={handleRegister}>
                <div className="form-head">
                  <h1>Create Account</h1>
                  <p>Register as a Petoty seller</p>
                </div>

                <div className="field-group">
                  {/* Mobile + OTP */}
                  <div className="field">
                    <span className="label-prefix">
                      Enter Mobile Number <span className="req">*</span>
                    </span>
                    <input
                      type="tel"
                      id="reg-mobile"
                      placeholder=""
                      maxLength={10}
                    />
                    <button
                      type="button"
                      className={`otp-btn ${otpSentMobile ? "sent" : ""}`}
                      onClick={() => setOtpSentMobile(true)}
                    >
                      {otpSentMobile ? "OTP Sent ✓" : "Send OTP"}
                    </button>
                  </div>

                  {/* Email + OTP */}
                  <div className="field">
                    <span className="label-prefix">
                      Email ID <span className="req">*</span>
                    </span>
                    <input
                      type="email"
                      id="reg-email"
                      placeholder=""
                    />
                    <button
                      type="button"
                      className={`otp-btn ${otpSentEmail ? "sent" : ""}`}
                      onClick={() => setOtpSentEmail(true)}
                    >
                      {otpSentEmail ? "OTP Sent ✓" : "Send OTP"}
                    </button>
                  </div>

                  {/* Create Password */}
                  <div className="field">
                    <span className="label-prefix">
                      Create Password <span className="req">*</span>
                    </span>
                    <input
                      type={showPass ? "text" : "password"}
                      id="reg-password"
                      placeholder=""
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPass(!showPass)}
                      aria-label="Toggle password"
                    >
                      {showPass ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="field">
                    <span className="label-prefix">
                      Confirm Password <span className="req">*</span>
                    </span>
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      id="reg-confirm-password"
                      placeholder=""
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      aria-label="Toggle confirm password"
                    >
                      {showConfirmPass ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>

                  <p className="terms">
                    By continuing, I agree to Petoty&apos;s{" "}
                    <a href="#">Terms of Use</a> &amp; <a href="#">Privacy Policy</a>
                  </p>

                  <button type="submit" className="submit-btn">
                    Register &amp; Continue <span className="arrow-icon">→</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ══ RIGHT PANEL ══ */}
          <div className="right">
            {/* Decorative blob */}
            <svg className="blob-bg" viewBox="0 0 360 320" fill="none">
              <path d="M290 45C345 88 372 175 330 235C288 295 185 325 105 292C25 259 -18 175 12 103C42 31 128 -8 210 4C252 10 248 10 290 45Z" fill="#3a9aa6"/>
            </svg>

            {/* Illustration */}
            <div className="illus-wrap">
              <svg width="210" height="195" viewBox="0 0 210 195" fill="none">
                {/* Teal blob platform */}
                <path d="M55 135C35 115 30 80 50 60C70 40 110 38 135 52C160 66 172 97 162 122C152 147 124 161 99 158C74 155 75 155 55 135Z" fill="#4CC9CF" opacity="0.8"/>

                {/* Phone */}
                <rect x="62" y="68" width="74" height="106" rx="9" fill="#2d2d2d"/>
                <rect x="67" y="75" width="64" height="89" rx="5" fill="#f5f5f5"/>
                <rect x="88" y="72" width="22" height="5" rx="2.5" fill="#1a1a1a"/>
                <rect x="90" y="169" width="18" height="3" rx="1.5" fill="#555"/>

                {/* Store */}
                <rect x="78" y="108" width="42" height="41" rx="3" fill="#fff" stroke="#e0e0e0" strokeWidth="0.8"/>
                <rect x="91" y="124" width="16" height="25" rx="2" fill="#b8dde0"/>
                <circle cx="105" cy="136" r="1.3" fill="#888"/>
                <rect x="80" y="113" width="9" height="8" rx="1.5" fill="#b8dde0"/>
                <rect x="109" y="113" width="9" height="8" rx="1.5" fill="#b8dde0"/>

                {/* Awning */}
                <path d="M73 108 Q99 97 127 108 L124 111 Q99 101 76 111Z" fill="#e74c3c"/>
                <path d="M76 111 Q99 101 124 111 L121 114 Q99 105 79 114Z" fill="#fff"/>
                <path d="M79 114 Q99 105 121 114 L118 117 Q99 109 82 117Z" fill="#e74c3c"/>
                <path d="M73 108 L127 108 L125 111 L75 111Z" fill="#c0392b"/>

                {/* Trees */}
                <ellipse cx="75" cy="118" rx="6" ry="8" fill="#2ecc71" opacity="0.9"/>
                <rect x="73.5" y="125" width="2.5" height="6" rx="1" fill="#7b5e3a"/>
                <ellipse cx="124" cy="118" rx="6" ry="8" fill="#27ae60" opacity="0.9"/>
                <rect x="122.5" y="125" width="2.5" height="6" rx="1" fill="#7b5e3a"/>
              </svg>
            </div>

            {/* Text */}
            <div className="grow-text">
              <h2>
                Grow<br />
                your business<br />
                with <span className="brand">Petoty</span>
              </h2>
              <p className="sub">
                Not Registered yet?{" "}
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setTab("register"); }}
                >
                  Get Started
                </a>
              </p>
            </div>

            <p className="copyright">Copyright © 2024 – 2025 Petoty.com</p>
          </div>
        </div>
      </div>
    </>
  );
}