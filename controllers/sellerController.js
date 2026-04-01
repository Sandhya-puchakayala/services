const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { sendOTPToPhone, sendOTPToEmail, verifyOTP } = require('../services/otpService');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// @desc    Register new seller
// @route   POST /api/sellers/register
// @access  Public
const registerSeller = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'Please add all required fields' });
  }

  try {
    // Check if seller exists
    const sellerExists = await Seller.findOne({ email });

    if (sellerExists) {
      return res.status(400).json({ message: 'Seller already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create seller
    const seller = await Seller.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    if (seller) {
      res.status(201).json({
        _id: seller.id,
        name: seller.name,
        email: seller.email,
        token: generateToken(seller._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid seller data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a seller
// @route   POST /api/sellers/login
// @access  Public
const loginSeller = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for seller email
    const seller = await Seller.findOne({ email });

    if (seller && (await bcrypt.compare(password, seller.password))) {
      console.log('✅ [DEBUG] Login successful for:', email);
      console.log('📝 [DEBUG] Registration step:', seller.registrationStep);
      
      res.json({
        _id: seller.id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        registrationStep: seller.registrationStep || 1,
        token: generateToken(seller._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update seller shop details
// @route   PUT /api/sellers/shop
// @access  Private
const updateShop = async (req, res) => {
  const { shopName, address, description } = req.body;

  try {
    const seller = await Seller.findById(req.sellerId);

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    seller.shopDetails = {
      shopName: shopName || seller.shopDetails?.shopName,
      address: address || seller.shopDetails?.address,
      description: description || seller.shopDetails?.description,
    };

    const updatedSeller = await seller.save();

    res.json({
      shopDetails: updatedSeller.shopDetails
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update all seller account details
// @route   PUT /api/sellers/account
// @access  Private
const updateAccount = async (req, res) => {
  const { 
    name, phone, displayName, shopAddress, shopDescription, category, 
    gstin, panNumber, businessName, businessAddress, pincode,
    accountHolderName, accountNumber, bankName, ifscCode, accountType,
    documents 
  } = req.body;

  try {
    const seller = await Seller.findById(req.sellerId);

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Update personal info
    if (name) seller.name = name;
    if (phone) seller.phone = phone;
    
    // Update store details
    seller.shopDetails = {
      fullName: name || seller.shopDetails?.fullName,
      displayName: displayName || seller.shopDetails?.displayName,
      address: shopAddress || seller.shopDetails?.address,
      description: shopDescription || seller.shopDetails?.description,
      latitude: seller.shopDetails?.latitude,
      longitude: seller.shopDetails?.longitude,
    };

    // Update category and category-specific fields
    if (category) {
      seller.category = category;
      
      if (category === 'All Categories') {
        seller.gstin = gstin || seller.gstin;
        seller.panNumber = undefined;
        seller.businessName = undefined;
        seller.businessAddress = undefined;
        seller.pincode = undefined;
      } else if (category === 'Only Books') {
        seller.panNumber = panNumber || seller.panNumber;
        seller.businessName = businessName || seller.businessName;
        seller.businessAddress = businessAddress || seller.businessAddress;
        seller.pincode = pincode || seller.pincode;
        seller.gstin = undefined;
      }
    }
    
    // Update account details
    seller.accountDetails = {
      holderName: accountHolderName || seller.accountDetails?.holderName,
      accountNumber: accountNumber || seller.accountDetails?.accountNumber,
      bankName: bankName || seller.accountDetails?.bankName,
      ifscCode: ifscCode || seller.accountDetails?.ifscCode,
      accountType: accountType || seller.accountDetails?.accountType || 'savings',
    };
    
    // Handle documents
    if (documents) {
      if (Array.isArray(documents)) {
         seller.documents = documents;
      } else {
         seller.documents = [documents];
      }
    }

    const updatedSeller = await seller.save();

    console.log('✅ [DEBUG] Account updated for seller:', updatedSeller.name);

    res.json({
      success: true,
      message: 'Account updated successfully',
      seller: {
        _id: updatedSeller._id,
        name: updatedSeller.name,
        email: updatedSeller.email,
        phone: updatedSeller.phone,
        category: updatedSeller.category,
        registrationStep: updatedSeller.registrationStep,
        shopDetails: updatedSeller.shopDetails,
        gstin: updatedSeller.gstin,
        panNumber: updatedSeller.panNumber,
        accountDetails: updatedSeller.accountDetails,
        documents: updatedSeller.documents
      }
    });
  } catch (error) {
    console.error('❌ [DEBUG] Error updating account:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a product
// @route   POST /api/sellers/products
// @access  Private
const addProduct = async (req, res) => {
  const { 
    name, description, shortDescription, price, salePrice, sku, image, images, type, category, 
    status, stock, stockStatus, shipping, linked, isVirtual, isDownloadable 
  } = req.body;

  if (!name || price === undefined) {
     return res.status(400).json({ message: 'Please provide required product fields (name, price)' });
  }

  try {
    const product = await Product.create({
      name,
      description,
      shortDescription,
      price,
      salePrice,
      sku,
      image,
      images: images || [],
      type: type || 'Simple product',
      category,
      status: status || 'Draft',
      stock: stock || 0,
      stockStatus: stockStatus || 'In stock',
      shipping: shipping || { weight: 0, dimensions: { length: 0, width: 0, height: 0 }, shippingClass: 'No shipping class' },
      linked: linked || { upsells: [], crossSells: [] },
      isVirtual: isVirtual || false,
      isDownloadable: isDownloadable || false,
      seller: req.sellerId,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/sellers/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.sellerId) {
      return res.status(401).json({ message: 'Not authorized to update this product' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/sellers/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.sellerId) {
      return res.status(401).json({ message: 'Not authorized to delete this product' });
    }

    await product.deleteOne();

    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a service
// @route   POST /api/sellers/services
// @access  Private
const addService = async (req, res) => {
  const { 
    name, description, shortDescription, price, image, images, serviceType, category, 
    status, duration, availability, linked
  } = req.body;

  if (!name || price === undefined) {
     return res.status(400).json({ message: 'Please provide required service fields (name, price)' });
  }

  try {
    const service = await Service.create({
      name,
      description,
      shortDescription,
      price,
      image,
      images: images || [],
      serviceType: serviceType || 'Standard',
      category,
      status: status || 'Draft',
      duration: duration || '',
      availability: availability || 'Available',
      linked: linked || { upsells: [], crossSells: [] },
      seller: req.sellerId,
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a service
// @route   PUT /api/sellers/services/:id
// @access  Private
const updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.seller.toString() !== req.sellerId) {
      return res.status(401).json({ message: 'Not authorized to update this service' });
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a service
// @route   DELETE /api/sellers/services/:id
// @access  Private
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.seller.toString() !== req.sellerId) {
      return res.status(401).json({ message: 'Not authorized to delete this service' });
    }

    await service.deleteOne();

    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send OTP to mobile
// @route   POST /api/sellers/send-otp-mobile
// @access  Public
const sendOtpMobile = async (req, res) => {
  const { phone } = req.body;
  
  console.log('🔹 [DEBUG] sendOtpMobile called with phone:', phone);

  if (!phone || phone.length !== 10) {
    console.log('❌ [DEBUG] Invalid phone length:', phone?.length);
    return res.status(400).json({ message: 'Please provide a valid 10-digit phone number' });
  }

  try {
    console.log('📝 [DEBUG] Calling sendOTPToPhone...');
    const result = await sendOTPToPhone(phone);
    console.log('✅ [DEBUG] OTP sent successfully:', result);
    res.json(result);
  } catch (error) {
    console.log('❌ [DEBUG] Error in sendOtpMobile:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send OTP to email
// @route   POST /api/sellers/send-otp-email
// @access  Public
const sendOtpEmail = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  try {
    const result = await sendOTPToEmail(email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/sellers/verify-otp
// @access  Public
const verifyOtpCode = async (req, res) => {
  const { identifier, otp } = req.body;

  if (!identifier || !otp) {
    return res.status(400).json({ message: 'Please provide identifier and OTP' });
  }

  try {
    const result = verifyOTP(identifier, otp);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register with OTP verification
// @route   POST /api/sellers/register-otp
// @access  Public
const registerSellerWithOtp = async (req, res) => {
  const { name, email, password, phone, phoneOtp, emailOtp } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'Please add all required fields' });
  }

  if (!phoneOtp || !emailOtp) {
    return res.status(400).json({ message: 'Please verify both phone and email with OTP' });
  }

  try {
    // Verify phone OTP
    const phoneVerified = verifyOTP(phone, phoneOtp);
    if (!phoneVerified.success) {
      return res.status(400).json({ message: 'Phone OTP is invalid or expired. Please try again.' });
    }

    // Verify email OTP
    const emailVerified = verifyOTP(email, emailOtp);
    if (!emailVerified.success) {
      return res.status(400).json({ message: 'Email OTP is invalid or expired. Please try again.' });
    }

    // Check if seller already exists
    const sellerExists = await Seller.findOne({ $or: [{ email }, { phone }] });
    if (sellerExists) {
      return res.status(400).json({ message: 'Seller with this email or phone already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('🔹 [DEBUG] Creating new seller with email:', email);

    // Create seller
    const seller = await Seller.create({
      name,
      email,
      password: hashedPassword,
      phone,
      registrationStep: 1, // Step 1 complete (OTP verified)
    });

    console.log('✅ [DEBUG] Seller created successfully:', seller._id);

    res.status(201).json({
      _id: seller.id,
      name: seller.name,
      email: seller.email,
      phone: seller.phone,
      token: generateToken(seller._id),
    });
  } catch (error) {
    console.log('❌ [DEBUG] Error in registerSellerWithOtp:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login with OTP verification
// @route   POST /api/sellers/login-otp
// @access  Public
const loginSellerWithOtp = async (req, res) => {
  const { email, phone, otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: 'Please provide OTP' });
  }

  if (!email && !phone) {
    return res.status(400).json({ message: 'Please provide email or phone' });
  }

  try {
    // Verify OTP
    const identifier = email || phone;
    const result = verifyOTP(identifier, otp);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Find seller by email or phone
    const seller = await Seller.findOne({ $or: [{ email }, { phone }] });

    if (!seller) {
      return res.status(401).json({ message: 'Seller not found. Please register first.' });
    }

    res.json({
      _id: seller.id,
      name: seller.name,
      email: seller.email,
      phone: seller.phone,
      token: generateToken(seller._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update seller registration step 2 (GSTIN, signature, store details)
// @route   PUT /api/sellers/registration-step2
// @access  Private
const updateRegistrationStep2 = async (req, res) => {
  const { category, gstin, panNumber, businessName, businessAddress, pincode, addressFileName, eSignature, storeFullName, storeDisplayName, storeDescription, storeAddress, latitude, longitude, accountHolderName, accountNumber, bankName, ifscCode, accountType } = req.body;

  console.log('🔹 [DEBUG] updateRegistrationStep2 called with:', { category, gstin, panNumber, businessName, storeFullName, accountHolderName });

  try {
    // Find seller by ID (from protected middleware)
    const seller = await Seller.findById(req.sellerId);

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Update seller with step 2 details
    seller.registrationStep = 2;
    seller.category = category || seller.category;
    
    // Save category-specific fields
    if (category === 'All Categories') {
      seller.gstin = gstin || seller.gstin;
      seller.panNumber = undefined;
      seller.businessName = undefined;
      seller.businessAddress = undefined;
      seller.pincode = undefined;
    } else {
      seller.panNumber = panNumber || seller.panNumber;
      seller.businessName = businessName || seller.businessName;
      seller.businessAddress = businessAddress || seller.businessAddress;
      seller.pincode = pincode || seller.pincode;
      seller.addressFileName = addressFileName || seller.addressFileName;
      seller.gstin = undefined;
    }
    
    seller.eSignature = eSignature || seller.eSignature;
    seller.shopDetails = {
      fullName: storeFullName || seller.shopDetails?.fullName,
      displayName: storeDisplayName || seller.shopDetails?.displayName,
      description: storeDescription || seller.shopDetails?.description,
      address: storeAddress || seller.shopDetails?.address,
      latitude: latitude || seller.shopDetails?.latitude,
      longitude: longitude || seller.shopDetails?.longitude,
    };
    
    // Add account details
    seller.accountDetails = {
      holderName: accountHolderName || seller.accountDetails?.holderName,
      accountNumber: accountNumber || seller.accountDetails?.accountNumber,
      bankName: bankName || seller.accountDetails?.bankName,
      ifscCode: ifscCode || seller.accountDetails?.ifscCode,
      accountType: accountType || seller.accountDetails?.accountType || 'savings',
    };

    await seller.save();

    console.log('✅ [DEBUG] Seller registration step 2 updated successfully with category:', category);

    res.json({
      success: true,
      message: 'Registration completed successfully!',
      seller: {
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        registrationStep: seller.registrationStep,
        category: seller.category,
      },
    });
  } catch (error) {
    console.log('❌ [DEBUG] Error in updateRegistrationStep2:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sellers (DEBUG ONLY)
// @route   GET /api/sellers/debug/all
// @access  Public
const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().select('-password'); // Don't return passwords
    
    console.log(`\n📊 [DEBUG] Found ${sellers.length} sellers in database:`);
    sellers.forEach((seller, index) => {
      console.log(`\n${index + 1}. ${seller.name}`);
      console.log(`   Email: ${seller.email}`);
      console.log(`   Phone: ${seller.phone}`);
      console.log(`   Registration Step: ${seller.registrationStep}`);
      console.log(`   GSTIN: ${seller.gstin || 'Not set'}`);
      console.log(`   Created: ${seller.createdAt}`);
    });
    console.log('\n');

    res.json({
      total: sellers.length,
      sellers: sellers.map(s => ({
        _id: s._id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        registrationStep: s.registrationStep,
        gstin: s.gstin,
        category: s.category,
        shopDetails: s.shopDetails,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard metrics for a seller
// @route   GET /api/sellers/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const seller = await Seller.findById(req.sellerId).select('-password');
    const products = await Product.find({ seller: req.sellerId });
    const services = await Service.find({ seller: req.sellerId });
    const orders = await Order.find({ seller: req.sellerId }).populate('products.product', 'name price');
    const payments = await Payment.find({ seller: req.sellerId }).populate('order', 'totalAmount status');

    res.json({
      seller,
      products,
      services,
      orders,
      payments,
    });
  } catch (error) {
     res.status(500).json({ message: error.message });
  }
}

module.exports = {
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
};
