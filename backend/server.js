const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.0.2:3080', 'http://localhost:3080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enhanced request logging
app.use((req, res, next) => {
  console.log(`\n=== ${new Date().toISOString()} ===`);
  console.log(`${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', req.body);
  }
  next();
});

// Import middleware and routes
const auth = require('./middleware/auth');

// Health check endpoint (public)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Grocery Inventory API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Test endpoint (public)
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend API is working perfectly!', 
    timestamp: new Date().toISOString()
  });
});

// Public routes (no authentication required)
app.use('/api/auth', require('./routes/auth'));

// Protected routes (authentication required)
app.use('/api/products', auth, require('./routes/products'));
app.use('/api/sales', auth, require('./routes/sales'));

// Sample data endpoint (protected - requires auth)
app.post('/api/setup/sample-data', auth, async (req, res) => {
  try {
    const Product = require('./models/Product');
    
    const sampleProducts = [
      {
        name: "Apples",
        sku: "FRU001",
        category: "Fruits",
        price: 50.00,
        cost: 30.00,
        quantity: 25,
        reorderLevel: 10,
        supplier: "Fresh Farms",
        description: "Fresh red apples",
        user: req.userId // Add current user ID
      },
      {
        name: "Milk",
        sku: "DAI001",
        category: "Dairy",
        price: 60.00,
        cost: 45.00,
        quantity: 15,
        reorderLevel: 8,
        supplier: "Dairy Fresh",
        description: "Full cream milk 1L",
        user: req.userId // Add current user ID
      },
      {
        name: "Bread",
        sku: "BAK001",
        category: "Bakery",
        price: 35.00,
        cost: 20.00,
        quantity: 5,
        reorderLevel: 6,
        supplier: "City Bakery",
        description: "Fresh white bread",
        user: req.userId // Add current user ID
      },
      {
        name: "Eggs",
        sku: "DAI002",
        category: "Dairy",
        price: 80.00,
        cost: 60.00,
        quantity: 3,
        reorderLevel: 5,
        supplier: "Happy Hens",
        description: "Farm fresh eggs (dozen)",
        user: req.userId // Add current user ID
      },
      {
        name: "Rice",
        sku: "GRO001",
        category: "Grains",
        price: 120.00,
        cost: 90.00,
        quantity: 20,
        reorderLevel: 10,
        supplier: "Grains Co",
        description: "Basmati rice 1kg",
        user: req.userId // Add current user ID
      }
    ];

    // Clear existing products for THIS USER only and insert sample data
    await Product.deleteMany({ user: req.userId });
    const createdProducts = await Product.insertMany(sampleProducts);
    
    res.json({
      message: 'Sample data added successfully for your account!',
      products: createdProducts
    });
  } catch (error) {
    console.error('Sample data error:', error);
    res.status(500).json({ message: 'Error setting up sample data' });
  }
});

// User-specific dashboard stats (protected)
app.get('/api/dashboard/stats', auth, async (req, res) => {
  try {
    const Product = require('./models/Product');
    const Sale = require('./models/Sale');
    
    // Get counts for current user only
    const totalProducts = await Product.countDocuments({ user: req.userId });
    const lowStockProducts = await Product.countDocuments({ 
      user: req.userId,
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });
    const totalSales = await Sale.countDocuments({ user: req.userId });
    
    // Calculate total revenue for current user only
    const sales = await Sale.find({ user: req.userId });
    const totalRevenue = sales.reduce((total, sale) => total + sale.totalAmount, 0);
    
    res.json({
      totalItems: totalProducts,
      lowStockItems: lowStockProducts,
      totalSales: totalSales,
      totalRevenue: totalRevenue
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    message: 'API endpoint not found', 
    path: req.originalUrl,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/test', 
      'POST /api/auth/login',
      'GET /api/dashboard/stats',
      'GET /api/products',
      'POST /api/products',
      'GET /api/sales',
      'POST /api/sales',
      'POST /api/setup/sample-data'
    ]
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

// MongoDB Connection with enhanced options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grocery-inventory', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
  console.log('📊 Database:', mongoose.connection.name);
  console.log('🎯 Host:', mongoose.connection.host);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('📡 MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed.');
  process.exit(0);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🎉 ====================================');
  console.log('🚀 Grocery Inventory Management System');
  console.log('📡 Server running on port:', PORT);
  console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔐 Multi-User Mode: ENABLED');
  console.log('🕒 Started at:', new Date().toISOString());
  console.log('✅ ====================================\n');
  
  console.log('📋 Available API Endpoints:');
  console.log('   GET  /api/health          - Health check');
  console.log('   GET  /api/test            - Test endpoint');
  console.log('   POST /api/auth/login      - User login');
  console.log('   GET  /api/dashboard/stats - User dashboard stats');
  console.log('   GET  /api/products        - Get user products');
  console.log('   POST /api/products        - Add user product');
  console.log('   GET  /api/sales           - Get user sales');
  console.log('   POST /api/sales           - Create user sale');
  console.log('   POST /api/setup/sample-data - Add sample products\n');
});