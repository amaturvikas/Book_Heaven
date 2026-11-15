import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role = 'customer' }) => {
  const { user, admin, deliveryBoy, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 my-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (role === 'customer') {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  }

  if (role === 'admin') {
    const adminToken = localStorage.getItem('adminToken');
    if (!admin && !adminToken) {
      return <Navigate to="/admin/login" replace />;
    }
    return children;
  }

  if (role === 'deliveryBoy') {
    const dbToken = localStorage.getItem('deliveryBoyToken');
    if (!deliveryBoy && !dbToken) {
      return <Navigate to="/delivery-boy/login" replace />;
    }
    return children;
  }

  return children;
};

export default ProtectedRoute;
