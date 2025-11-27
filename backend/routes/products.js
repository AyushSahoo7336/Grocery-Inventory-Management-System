const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all products for current user
router.get('/', auth, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { user: req.userId }; // Only get current user's products

    if (category && category !== 'All Categories') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get low stock products for current user
router.get('/low-stock', auth, async (req, res) => {
  try {
    const products = await Product.find({
      user: req.userId,
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });
    res.json(products);
  } catch (error) {
    console.error('Low stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product for current user
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating product for user:', req.userId);
    console.log('Product data:', req.body);

    const product = new Product({
      ...req.body,
      user: req.userId // Add user ID to product
    });

    await product.save();
    console.log('Product created successfully:', product.name);
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'SKU already exists for your account' 
      });
    }
    
    res.status(400).json({ 
      message: 'Error creating product: ' + error.message 
    });
  }
});

// Update product (only if belongs to current user)
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(400).json({ message: 'Error updating product' });
  }
});

// Delete product (only if belongs to current user)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.userId 
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(400).json({ message: 'Error deleting product' });
  }
});

module.exports = router;