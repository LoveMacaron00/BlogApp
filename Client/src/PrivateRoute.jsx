import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Element, ...rest }) => {
  const token = localStorage.getItem('token');
  const isAdmin = token ? JSON.parse(atob(token.split('.')[1])).id === 'admin' : false;

  return token && isAdmin ? Element : <Navigate to="/login" />;
};

export default PrivateRoute;
