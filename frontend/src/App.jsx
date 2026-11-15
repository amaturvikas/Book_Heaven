import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Customer Pages
import Home from './pages/Home';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import MyRentals from './pages/MyRentals';
import RentalDetails from './pages/RentalDetails';
import Profile from './pages/Profile';
import DeliveryTracking from './pages/DeliveryTracking';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBooks from './pages/admin/ManageBooks';
import ManageDeliveryBoys from './pages/admin/ManageDeliveryBoys';
import ManageDeliveries from './pages/admin/ManageDeliveries';
import AdminDeliveryDetails from './pages/admin/AdminDeliveryDetails';
import ManageOrders from './pages/admin/ManageOrders';
import ManageRentals from './pages/admin/ManageRentals';
import AdminReturnPickups from './pages/admin/AdminReturnPickups';
import ManagePayments from './pages/admin/ManagePayments';
import ManageUsers from './pages/admin/ManageUsers';

// Delivery Boy Pages
import DeliveryBoyLogin from './pages/deliveryBoy/DeliveryBoyLogin';
import DeliveryBoyDashboard from './pages/deliveryBoy/DeliveryBoyDashboard';
import MyDeliveries from './pages/deliveryBoy/MyDeliveries';
import DeliveryBoyDeliveryDetails from './pages/deliveryBoy/DeliveryBoyDeliveryDetails';
import DeliveryBoyReturnPickups from './pages/deliveryBoy/DeliveryBoyReturnPickups';
import DeliveryBoyHistory from './pages/deliveryBoy/DeliveryBoyHistory';
import DeliveryBoyProfile from './pages/deliveryBoy/DeliveryBoyProfile';

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1">
              <Routes>
                {/* Public Customer Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/books" element={<Books />} />
                <Route path="/books/:id" element={<BookDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/track" element={<DeliveryTracking />} />
                
                {/* Protected Customer Routes */}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute role="customer">
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute role="customer">
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-orders"
                  element={
                    <ProtectedRoute role="customer">
                      <MyOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-orders/:id"
                  element={
                    <ProtectedRoute role="customer">
                      <OrderDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-rentals"
                  element={
                    <ProtectedRoute role="customer">
                      <MyRentals />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-rentals/:id"
                  element={
                    <ProtectedRoute role="customer">
                      <RentalDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute role="customer">
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/reset-password/:token" element={<ResetPassword />} />
                <Route path="/admin/reset-password" element={<ResetPassword />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute role="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/books"
                  element={
                    <ProtectedRoute role="admin">
                      <ManageBooks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/delivery-boys"
                  element={
                    <ProtectedRoute role="admin">
                      <ManageDeliveryBoys />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/deliveries"
                  element={
                    <ProtectedRoute role="admin">
                      <ManageDeliveries />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/deliveries/:id"
                  element={
                    <ProtectedRoute role="admin">
                      <AdminDeliveryDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute role="admin">
                      <ManageOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/rentals"
                  element={
                    <ProtectedRoute role="admin">
                      <ManageRentals />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/return-pickups"
                  element={
                    <ProtectedRoute role="admin">
                      <AdminReturnPickups />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/payments"
                  element={
                    <ProtectedRoute role="admin">
                      <ManagePayments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute role="admin">
                      <ManageUsers />
                    </ProtectedRoute>
                  }
                />

                {/* Delivery Boy Routes */}
                <Route path="/delivery-boy/login" element={<DeliveryBoyLogin />} />
                <Route path="/delivery-boy/reset-password/:token" element={<ResetPassword />} />
                <Route path="/delivery-boy/reset-password" element={<ResetPassword />} />
                <Route
                  path="/delivery-boy/dashboard"
                  element={
                    <ProtectedRoute role="deliveryBoy">
                      <DeliveryBoyDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/delivery-boy/my-deliveries"
                  element={
                    <ProtectedRoute role="deliveryBoy">
                      <MyDeliveries />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/delivery-boy/deliveries/:id"
                  element={
                    <ProtectedRoute role="deliveryBoy">
                      <DeliveryBoyDeliveryDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/delivery-boy/return-pickups"
                  element={
                    <ProtectedRoute role="deliveryBoy">
                      <DeliveryBoyReturnPickups />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/delivery-boy/history"
                  element={
                    <ProtectedRoute role="deliveryBoy">
                      <DeliveryBoyHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/delivery-boy/profile"
                  element={
                    <ProtectedRoute role="deliveryBoy">
                      <DeliveryBoyProfile />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </Router>
  );
};

export default App;
