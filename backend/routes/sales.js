const express = require('express');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Create sale for current user
router.post('/', auth, async (req, res) => {
  try {
    const { items, paymentMethod } = req.body;
    console.log('Creating sale for user:', req.userId);

    const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    const saleItems = [];
    for (let item of items) {
      // Only access products belonging to current user
      const product = await Product.findOne({ 
        _id: item.product, 
        user: req.userId 
      });
      
      if (product) {
        if (product.quantity < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${product.name}` 
          });
        }

        // Update product quantity
        product.quantity -= item.quantity;
        await product.save();

        saleItems.push({
          product: item.product,
          productName: product.name,
          quantity: item.quantity,
          price: item.price
        });
      } else {
        return res.status(404).json({ 
          message: `Product not found in your inventory` 
        });
      }
    }

    const sale = new Sale({
      items: saleItems,
      totalAmount,
      paymentMethod,
      user: req.userId // Add user ID to sale
    });

    await sale.save();
    console.log('Sale created successfully for user:', req.userId);
    res.status(201).json(sale);
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(400).json({ message: 'Error creating sale' });
  }
});

// Get all sales for current user
router.get('/', auth, async (req, res) => {
  try {
    const sales = await Sale.find({ user: req.userId })
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;