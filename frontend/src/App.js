import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Items from './components/Items';
import Sales from './components/Sales';
import Sidebar from './components/Sidebar';
import './App.css';

// Axios configuration - USE ABSOLUTE URL
const API_BASE_URL = 'http://localhost:5000/api';
axios.defaults.baseURL = API_BASE_URL;

// Add request/response logging
axios.interceptors.request.use(
  (config) => {
    console.log('Making API request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    console.log('API response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
      const token = JSON.parse(userInfo).token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Starting login process for:', email);
      
      // Send login request directly
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { 
        email, 
        password 
      });

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      console.log('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('Login API error:', error);
      
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        return { 
          success: false, 
          message: 'Cannot connect to backend server. Make sure it\'s running on port 5000.' 
        };
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    delete axios.defaults.headers.common['Authorization'];
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {user ? (
          <div className="app-container">
            <Sidebar logout={logout} />
            <div className="main-content">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/items" element={<Items />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login login={login} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;