import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalSales: 0,
    totalRevenue: 0
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, lowStockRes, salesRes] = await Promise.all([
        axios.get('/dashboard/stats'),
        axios.get('/products/low-stock'),
        axios.get('/sales')
      ]);

      setStats({
        totalItems: statsRes.data.totalItems || 0,
        lowStockItems: statsRes.data.lowStockItems || 0,
        totalSales: statsRes.data.totalSales || 0,
        totalRevenue: statsRes.data.totalRevenue || 0
      });

      setLowStockProducts(lowStockRes.data || []);
      setRecentSales(salesRes.data.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        <div className="loading">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card total-items">
          <h3>Total Items</h3>
          <div className="number">{stats.totalItems}</div>
          <p>Products in inventory</p>
        </div>
        
        <div className="stat-card low-stock">
          <h3>Low Stock Items</h3>
          <div className="number">{stats.lowStockItems}</div>
          <p>Need reordering</p>
        </div>
        
        <div className="stat-card total-sales">
          <h3>Total Sales</h3>
          <div className="number">{stats.totalSales}</div>
          <p>All time sales</p>
        </div>
        
        <div className="stat-card revenue">
          <h3>Revenue</h3>
          <div className="number">₹{stats.totalRevenue.toFixed(2)}</div>
          <p>Total earnings</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="alert-section">
          <h2>📢 Low Stock Alerts</h2>
          {lowStockProducts.length === 0 ? (
            <p className="no-alerts">No low stock alerts 🎉</p>
          ) : (
            lowStockProducts.map(product => (
              <div key={product._id} className="alert-item">
                <div className="alert-info">
                  <strong>{product.name}</strong> 
                  <span className="sku">SKU: {product.sku}</span>
                  &nbsp;
                </div>
                <div className="alert-details">
                  <span className="stock-warning">
                    Only {product.quantity} left (Reorder at {product.reorderLevel})
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="recent-sales">
          <h2>🛒 Recent Sales</h2>
          {recentSales.length === 0 ? (
            <p className="no-sales">No recent sales</p>
          ) : (
            <div className="sales-list">
              {recentSales.map(sale => (
                <div key={sale._id} className="sale-item">
                  <div className="sale-amount">
                    ₹{sale.totalAmount.toFixed(2)}&nbsp;&nbsp;&nbsp;
                  </div>
                  <div className="sale-date">
                    {new Date(sale.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;