import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, ShoppingBag, User, LogOut, Package, Clock, Shield, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, admin, deliveryBoy, customerLogout, adminLogout, deliveryBoyLogout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleCustomerLogout = () => {
    customerLogout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div className="p-2 bg-success text-white rounded-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '38px', height: '38px' }}>
            <BookOpen size={22} />
          </div>
          <span className="navbar-brand-title">BOOK HEAVEN</span>
        </Link>

        <div className="d-flex align-items-center gap-2 d-lg-none">
          <ThemeToggle />
          <button
            className="navbar-toggler border-0 p-2"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Main Navigation Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-1">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`} to="/">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`} to="/books">
                Explore Books
              </NavLink>
            </li>
          </ul>

          {/* Right Action Items */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            <ThemeToggle className="d-none d-lg-inline-flex" />

            {/* If Customer is logged in */}
            {user && (
              <>
                <Link to="/cart" className="btn btn-outline-custom position-relative d-flex align-items-center gap-2">
                  <ShoppingBag size={18} />
                  <span className="d-none d-md-inline">Cart</span>
                  {cartCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <NotificationBell />

                <div className="dropdown">
                  <button
                    className="btn btn-outline-custom dropdown-toggle d-flex align-items-center gap-2"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <User size={18} className="text-secondary" />
                    <span className="d-none d-sm-inline font-weight-medium">{user.name.split(' ')[0]}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                    <li className="px-3 py-2 border-bottom">
                      <div className="fw-bold">{user.name}</div>
                      <small className="text-muted">{user.email}</small>
                    </li>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/my-orders">
                        <Package size={16} /> My Orders & Deliveries
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/my-rentals">
                        <Clock size={16} /> My Book Rentals
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/profile">
                        <User size={16} /> Account Profile
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger d-flex align-items-center gap-2 py-2" onClick={handleCustomerLogout}>
                        <LogOut size={16} /> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            )}

            {/* If Admin logged in */}
            {admin && !user && (
              <div className="d-flex align-items-center gap-2">
                <Link to="/admin/dashboard" className="btn btn-navy-custom d-flex align-items-center gap-1">
                  <Shield size={16} />
                  <span>Admin Dashboard</span>
                </Link>
                <button onClick={adminLogout} className="btn btn-outline-danger btn-sm" title="Admin Logout">
                  <LogOut size={16} />
                </button>
              </div>
            )}

            {/* If Delivery Boy logged in */}
            {deliveryBoy && !user && !admin && (
              <div className="d-flex align-items-center gap-2">
                <Link to="/delivery-boy/dashboard" className="btn btn-primary-custom d-flex align-items-center gap-1">
                  <Truck size={16} />
                  <span>Delivery Portal</span>
                </Link>
                <button onClick={deliveryBoyLogout} className="btn btn-outline-danger btn-sm" title="Delivery Boy Logout">
                  <LogOut size={16} />
                </button>
              </div>
            )}

            {/* If Guest (No user, admin, or delivery boy) */}
            {!user && !admin && !deliveryBoy && (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-custom">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary-custom">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
