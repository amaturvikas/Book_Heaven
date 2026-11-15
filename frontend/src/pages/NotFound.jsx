import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="container py-5 my-5 text-center">
      <div className="p-3 bg-light rounded-circle d-inline-flex mb-3">
        <BookOpen size={48} className="text-muted" />
      </div>
      <h1 className="display-4 fw-bold text-dark brand-font">404</h1>
      <h4 className="fw-semibold text-secondary mb-3">Page Not Found</h4>
      <p className="text-muted small mb-4">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary-custom d-inline-flex align-items-center gap-2">
        <Home size={16} /> Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
