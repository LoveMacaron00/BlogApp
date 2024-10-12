import React from 'react';
import { Link } from 'react-router-dom';
import './SidebarComponent.css';

function SidebarComponent() {
  return (
    <nav className="sidebar">
      <ul className="sidebar-list">
        <li className="sidebar-item">
          <Link to="/blogManager" className="sidebar-link">Blog Manager</Link>
        </li>
        <li className="sidebar-item">
          <Link to="/writer" className="sidebar-link">Writer</Link>
        </li>
      </ul>
    </nav>
  );
}

export default SidebarComponent;
