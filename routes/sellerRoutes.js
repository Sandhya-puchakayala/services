const express = require('express');
const router = express.Router();
const {
  registerSeller,
  loginSeller,
  sendOtpMobile,
  sendOtpEmail,
  verifyOtpCode,
  registerSellerWithOtp,
  loginSellerWithOtp,
  updateRegistrationStep2,
  getAllSellers,
  updateShop,
  updateAccount,
  addProduct,
  updateProduct,
  deleteProduct,
  addService,
  updateService,
  deleteService,
  getDashboard,
} = require('../controllers/sellerController');
const { protect } = require('../middlewares/authMiddleware');

// Auth routes
router.post('/register', registerSeller);
router.post('/login', loginSeller);
router.post('/send-otp-mobile', sendOtpMobile);
router.post('/send-otp-email', sendOtpEmail);
router.post('/verify-otp', verifyOtpCode);
router.post('/register-otp', registerSellerWithOtp);
router.post('/login-otp', loginSellerWithOtp);

// Debug routes (for development only)
router.get('/debug/all', getAllSellers);

// Protected routes
router.put('/registration-step2', protect, updateRegistrationStep2);
router.put('/account', protect, updateAccount);
router.post('/products', protect, addProduct);
router.put('/products/:id', protect, updateProduct);
router.delete('/products/:id', protect, deleteProduct);
router.post('/services', protect, addService);
router.put('/services/:id', protect, updateService);
router.delete('/services/:id', protect, deleteService);
router.get('/dashboard', protect, getDashboard);

module.exports = router;
