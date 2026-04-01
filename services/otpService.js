// Simple OTP service - stores OTPs in memory with expiration
// In production, use Redis or database

const otpStore = {}; // { phone/email: { otp, expiresAt, attempts } }
const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to phone (console log for development)
const sendOTPToPhone = async (phone) => {
  console.log('🟦 [OTP_SERVICE] Generating OTP for phone:', phone);
  const otp = generateOTP();
  console.log('🟦 [OTP_SERVICE] Generated OTP:', otp);
  
  otpStore[phone] = {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_TIME,
    attempts: 0,
  };
  
  // In production, integrate with SMS provider (Twilio, Amazon SNS, etc.)
  console.log(`\n📱📱📱 OTP sent to phone ${phone}: ${otp} 📱📱📱\n`);
  
  return { success: true, message: 'OTP sent to your mobile number', expiresIn: 300 };
};

// Send OTP to email (console log for development)
const sendOTPToEmail = async (email) => {
  const otp = generateOTP();
  otpStore[email] = {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_TIME,
    attempts: 0,
  };
  
  // In production, integrate with email provider (Nodemailer, SendGrid, etc.)
  console.log(`📧 OTP sent to email ${email}: ${otp}`);
  
  return { success: true, message: 'OTP sent to your email address', expiresIn: 300 };
};

// Verify OTP
const verifyOTP = (identifier, otp) => {
  const storedOTP = otpStore[identifier];
  
  if (!storedOTP) {
    return { success: false, message: 'OTP not found or expired. Please request a new OTP.' };
  }
  
  if (Date.now() > storedOTP.expiresAt) {
    delete otpStore[identifier];
    return { success: false, message: 'OTP expired. Please request a new OTP.' };
  }
  
  if (storedOTP.attempts >= MAX_ATTEMPTS) {
    delete otpStore[identifier];
    return { success: false, message: 'Max attempts exceeded. Please request a new OTP.' };
  }
  
  if (storedOTP.otp !== otp) {
    storedOTP.attempts += 1;
    return { success: false, message: 'Invalid OTP. Please try again.', remaining: MAX_ATTEMPTS - storedOTP.attempts };
  }
  
  // OTP verified successfully
  delete otpStore[identifier];
  return { success: true, message: 'OTP verified successfully' };
};

// Clear expired OTPs (cleanup)
const clearExpiredOTPs = () => {
  for (const key in otpStore) {
    if (Date.now() > otpStore[key].expiresAt) {
      delete otpStore[key];
    }
  }
};

// Run cleanup every 1 minute
setInterval(clearExpiredOTPs, 60000);

module.exports = {
  sendOTPToPhone,
  sendOTPToEmail,
  verifyOTP,
  clearExpiredOTPs,
};
