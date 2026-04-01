const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  
  // Registration Status
  registrationStep: {
    type: Number,
    default: 1, // 1 = OTP verified, 2 = Full registration completed
  },
  
  // Step 2: ID & Signature Verification - For All Categories
  category: {
    type: String,
    enum: ['All Categories', 'Only Books'],
    default: 'All Categories',
  },
  gstin: {
    type: String,
    trim: true,
  },
  gstVerified: {
    type: Boolean,
    default: false,
  },
  
  // Step 2: ID & Signature Verification - For Only Books
  panNumber: {
    type: String,
    trim: true,
  },
  panVerified: {
    type: Boolean,
    default: false,
  },
  businessName: {
    type: String,
    trim: true,
  },
  businessAddress: {
    type: String,
    trim: true,
  },
  pincode: {
    type: String,
    trim: true,
  },
  addressFileName: {
    type: String,
    trim: true,
  },
  
  eSignature: {
    type: String, // File path or base64 encoded signature
    trim: true,
  },
  
  // Step 2: Store & Pickup Details
  shopDetails: {
    fullName: String,
    displayName: String,
    description: String,
    shopName: String,
    address: String,
    latitude: Number,
    longitude: Number,
  },
  
  // Step 2: Account Details
  accountDetails: {
    holderName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    accountType: {
      type: String,
      enum: ['savings', 'current'],
      default: 'savings',
    },
  },
  
  // Old fields for backward compatibility
  gstNumber: {
    type: String,
    trim: true,
  },
  documents: [{
    type: String,
  }],
}, {
  timestamps: true,
});

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;
