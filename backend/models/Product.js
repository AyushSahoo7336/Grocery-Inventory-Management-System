const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true
    // Remove unique constraint for now
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  reorderLevel: {
    type: Number,
    required: true,
    default: 10
  },
  supplier: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Remove the unique index temporarily
// productSchema.index({ sku: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);