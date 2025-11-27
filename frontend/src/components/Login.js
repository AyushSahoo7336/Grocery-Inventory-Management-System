import React, { useState } from 'react';

const Login = ({ login }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting login with:', formData.email);
      
      const result = await login(formData.email, formData.password);
      
      if (!result.success) {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please check if backend is running.');
      console.error('Login error:', err);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Welcome Back</h1>
        <p>Sign in to your inventory account</p>
        
        {error && (
          <div style={{
            color: 'red', 
            background: '#ffe6e6', 
            padding: '10px', 
            borderRadius: '5px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        
        <div className="demo-note">
          Enter email and password to login
        </div>
      </form>
    </div>
  );
};

export default Login;