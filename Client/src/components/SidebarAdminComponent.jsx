import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SidebarAdminComponent.css';

function SidebarComponent() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="sidebar">
      <ul className="sidebar-list">
        <li className="sidebar-item">
          <Link to="/adminManager" className="sidebar-link">ผู้ใช้</Link>
        </li>
        <li className="sidebar-item">
          <Link to="/category" className="sidebar-link">หมวดหมู่</Link>
        </li>
        <li className="sidebar-item">
          <button onClick={handleLogout} className="sidebar-link">Logout</button>
        </li>
      </ul>
    </nav>
  );
}

export default SidebarComponent;
