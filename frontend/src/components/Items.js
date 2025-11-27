import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Items = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    cost: '',
    quantity: '',
    reorderLevel: '',
    supplier: '',
    description: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products');
      setProducts(res.data);
      
      const uniqueCategories = [...new Set(res.data.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'All Categories') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/products/${id}`);
        fetchProducts();
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      cost: product.cost,
      quantity: product.quantity,
      reorderLevel: product.reorderLevel,
      supplier: product.supplier,
      description: product.description || ''
    });
    setShowEditForm(true);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/products', {
        ...newProduct,
        price: parseFloat(newProduct.price),
        cost: parseFloat(newProduct.cost),
        quantity: parseInt(newProduct.quantity),
        reorderLevel: parseInt(newProduct.reorderLevel)
      });
      
      setNewProduct({
        name: '',
        sku: '',
        category: '',
        price: '',
        cost: '',
        quantity: '',
        reorderLevel: '',
        supplier: '',
        description: ''
      });
      
      setShowAddForm(false);
      fetchProducts();
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product: ' + error.response?.data?.message);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/products/${editingProduct._id}`, {
        ...newProduct,
        price: parseFloat(newProduct.price),
        cost: parseFloat(newProduct.cost),
        quantity: parseInt(newProduct.quantity),
        reorderLevel: parseInt(newProduct.reorderLevel)
      });
      
      setNewProduct({
        name: '',
        sku: '',
        category: '',
        price: '',
        cost: '',
        quantity: '',
        reorderLevel: '',
        supplier: '',
        description: ''
      });
      
      setShowEditForm(false);
      setEditingProduct(null);
      fetchProducts();
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product: ' + error.response?.data?.message);
    }
  };

  const handleInputChange = (e) => {
    setNewProduct({
      ...newProduct,
      [e.target.name]: e.target.value
    });
  };

  const closeModals = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingProduct(null);
    setNewProduct({
      name: '',
      sku: '',
      category: '',
      price: '',
      cost: '',
      quantity: '',
      reorderLevel: '',
      supplier: '',
      description: ''
    });
  };

  return (
    <div className="items">
      <div className="items-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All Categories">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <button 
            className="btn btn-success"
            onClick={() => setShowAddForm(true)}
          >
            Add New Item
          </button>
        </div>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Product</h3>
            <form onSubmit={handleAddProduct}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    value={newProduct.sku}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Category *</label>
                <input
                  type="text"
                  name="category"
                  value={newProduct.category}
                  onChange={handleInputChange}
                  placeholder="Fruits, Vegetables, Dairy, etc."
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cost (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cost"
                    value={newProduct.cost}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={newProduct.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Reorder Level *</label>
                  <input
                    type="number"
                    name="reorderLevel"
                    value={newProduct.reorderLevel}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Supplier *</label>
                <input
                  type="text"
                  name="supplier"
                  value={newProduct.supplier}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                  placeholder="Product description (optional)"
                  rows="3"
                />
              </div>
              
              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  Add Product
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={closeModals}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Form */}
      {showEditForm && editingProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Product</h3>
            <form onSubmit={handleUpdateProduct}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    value={newProduct.sku}
                    onChange={handleInputChange}
                    required
                    disabled
                  />
                  <small style={{color: '#666', fontSize: '12px'}}>SKU cannot be changed</small>
                </div>
              </div>
              
              <div className="form-group">
                <label>Category *</label>
                <input
                  type="text"
                  name="category"
                  value={newProduct.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cost (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cost"
                    value={newProduct.cost}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={newProduct.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Reorder Level *</label>
                  <input
                    type="number"
                    name="reorderLevel"
                    value={newProduct.reorderLevel}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Supplier *</label>
                <input
                  type="text"
                  name="supplier"
                  value={newProduct.supplier}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                  placeholder="Product description (optional)"
                  rows="3"
                />
              </div>
              
              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  Update Product
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={closeModals}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Reorder Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>{product.sku}</td>
                <td>{product.category}</td>
                <td>₹{product.price.toFixed(2)}</td>
                <td className={product.quantity <= product.reorderLevel ? 'low-stock' : ''}>
                  {product.quantity}
                  {product.quantity <= product.reorderLevel && (
                    <span style={{color: '#e74c3c', marginLeft: '5px', fontSize: '12px'}}>⚠️ Low</span>
                  )}
                </td>
                <td>{product.reorderLevel}</td>
                <td className="actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(product._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredProducts.length === 0 && (
          <div className="no-products">
            <p>No products found. {searchTerm ? 'Try a different search.' : 'Add your first product!'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Items;