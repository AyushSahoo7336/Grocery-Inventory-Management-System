import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ logout }) => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Inventory System</h2>
      </div>
      
      <ul className="sidebar-nav">
        <li>
          <Link 
            to="/dashboard" 
            className={location.pathname === '/dashboard' ? 'active' : ''}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link 
            to="/items" 
            className={location.pathname === '/items' ? 'active' : ''}
          >
            Items
          </Link>
        </li>
        <li>
          <Link 
            to="/sales" 
            className={location.pathname === '/sales' ? 'active' : ''}
          >
            Sales
          </Link>
        </li>
        <li>
          <button onClick={logout}>
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;