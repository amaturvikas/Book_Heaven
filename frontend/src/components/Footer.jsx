import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Shield, Truck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer-custom">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="p-2 bg-success text-white rounded-3 d-flex align-items-center justify-content-center">
                <BookOpen size={20} />
              </div>
              <h5 className="mb-0 text-white brand-font">BOOK HEAVEN</h5>
            </div>
            <p className="small text-secondary mb-3">
              A comprehensive MERN stack academic project demonstrating an online bookstore, daily rental system with automated due-date calculation, Razorpay/COD checkout, and full-lifecycle delivery boy task management.
            </p>
            <div className="d-flex gap-2">
              <span className="badge bg-secondary">MongoDB</span>
              <span className="badge bg-secondary">Express.js</span>
              <span className="badge bg-secondary">React 18</span>
              <span className="badge bg-secondary">Node.js</span>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="text-white fw-bold mb-3">Customer Service</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li><Link to="/books">Browse Books</Link></li>
              <li><Link to="/my-orders">Track Orders</Link></li>
              <li><Link to="/my-rentals">Rental Status</Link></li>
              <li><Link to="/cart">Cart & Checkout</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">Staff & Management</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/admin/login" className="d-flex align-items-center gap-1 text-light">
                  <Shield size={14} className="text-warning" /> Administrator Portal
                </Link>
              </li>
              <li>
                <Link to="/delivery-boy/login" className="d-flex align-items-center gap-1 text-light">
                  <Truck size={14} className="text-info" /> Delivery Agent Portal
                </Link>
              </li>
              <li><Link to="/forgot-password">Password Recovery</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">Project Specs</h6>
            <p className="small text-secondary mb-1">
              <strong>Database:</strong> MongoDB Community Server
            </p>
            <p className="small text-secondary mb-1">
              <strong>Security:</strong> JWT, SHA-256 Reset Tokens, Bcrypt
            </p>
            <p className="small text-secondary">
              <strong>Fulfillment:</strong> Active Delivery Boy state-machine validation
            </p>
          </div>
        </div>

        <div className="border-top border-secondary pt-3 d-flex flex-column flex-md-row justify-content-between align-items-center small text-secondary">
          <div>
            &copy; {new Date().getFullYear()} Book Heaven. Built for BCA Final-Year Project.
          </div>
          <div className="d-flex align-items-center gap-1 mt-2 mt-md-0">
            <span>Crafted with</span> <Heart size={14} className="text-danger fill-danger" /> <span>using MERN Stack</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
