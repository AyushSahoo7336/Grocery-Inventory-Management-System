import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product === product._id);
    
    if (existingItem) {
      if (existingItem.quantity < product.quantity) {
        setCart(cart.map(item =>
          item.product === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      if (product.quantity > 0) {
        setCart([...cart, {
          product: product._id,
          productName: product.name,
          price: product.price,
          quantity: 1
        }]);
      }
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      setCart(cart.filter(item => item.product !== productId));
    } else {
      const product = products.find(p => p._id === productId);
      if (product && newQuantity <= product.quantity) {
        setCart(cart.map(item =>
          item.product === productId
            ? { ...item, quantity: newQuantity }
            : item
        ));
      }
    }
  };

  const processSale = async () => {
    if (cart.length === 0) return;

    try {
      await axios.post('/sales', {
        items: cart,
        paymentMethod: 'cash'
      });
      
      setCart([]);
      fetchProducts();
      alert('Sale processed successfully!');
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Error processing sale');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    product.quantity > 0
  );

  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="sales">
      <h1>Sales</h1>
      
      <div className="sales-container">
        <div className="available-items">
          <h2>Available Items</h2>
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{width: '100%', padding: '10px', marginBottom: '20px'}}
          />
          
          <div className="item-list">
            {filteredProducts.map(product => (
              <div
                key={product._id}
                className="item-card"
                onClick={() => addToCart(product)}
              >
                <div className="item-info">
                  <div className="item-name">{product.name}</div>
                  <div className="item-details">
                    ₹{product.price.toFixed(2)} • Stock: {product.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="current-sale">
          <h2>Current Sale</h2>
          
          {cart.length === 0 ? (
            <p>No items added yet</p>
          ) : (
            <>
              <div className="sale-items">
                {cart.map(item => (
                  <div key={item.product} className="sale-item">
                    <div>
                      <div>{item.productName}</div>
                      <div>₹{item.price.toFixed(2)} x {item.quantity}</div>
                    </div>
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.product, item.quantity - 1)}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product, item.quantity + 1)}>
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="sale-total">
                Total: ₹{totalAmount.toFixed(2)}
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={processSale}
                style={{width: '100%', marginTop: '20px'}}
              >
                Process Sale
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sales;