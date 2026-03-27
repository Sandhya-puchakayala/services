const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  shortDescription: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String, // URL to image
  },
  images: [{
    type: String, // Array of extra gallery images
  }],
  serviceType: {
    type: String,
    default: 'Standard', // Standard, Premium, Consultation, Support
  },
  category: {
    type: String,
  },
  status: {
    type: String,
    default: 'Draft', // Draft, Online, Published
  },
  duration: {
    type: String, // e.g., "1 hour", "2 days", "By agreement"
  },
  availability: {
    type: String,
    default: 'Available', // Available, Unavailable, Coming Soon
  },
  linked: {
    upsells: [{ type: String }],
    crossSells: [{ type: String }]
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
  },
}, {
  timestamps: true,
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
