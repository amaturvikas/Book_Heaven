import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  BookOpen,
  ShoppingBag,
  Clock,
  Truck,
  Users,
  CreditCard,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Package
} from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-warning" role="status"></div>
        <div className="text-muted small mt-2">Loading administrative metrics...</div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const recentDeliveries = data?.recentDeliveries || [];

  return (
    <div className="container py-4">
      {/* Top Banner */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-warning text-dark px-2 py-1">Admin Mode</span>
            <h2 className="fw-bold text-dark brand-font mb-0">System Control Center</h2>
          </div>
          <span className="text-muted small">Live analytics and operational oversight</span>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/books" className="btn btn-primary-custom btn-sm">
            + Add New Book
          </Link>
          <Link to="/admin/delivery-boys" className="btn btn-outline-custom btn-sm">
            + New Delivery Boy
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="row g-3 mb-4">
        {/* Total Revenue */}
        <div className="col-sm-6 col-lg-3">
          <div className="kpi-card">
            <div className="kpi-icon-wrapper bg-success-subtle text-success">
              <TrendingUp size={24} />
            </div>
            <div>
              <span className="text-muted small d-block">TOTAL REVENUE</span>
              <h4 className="fw-bold mb-0 text-dark">₹{(stats.totalRevenue || 0).toLocaleString()}</h4>
            </div>
          </div>
        </div>

        {/* Active Deliveries */}
        <div className="col-sm-6 col-lg-3">
          <div className="kpi-card">
            <div className="kpi-icon-wrapper bg-info-subtle text-info">
              <Truck size={24} />
            </div>
            <div>
              <span className="text-muted small d-block">ACTIVE DELIVERIES</span>
              <h4 className="fw-bold mb-0 text-dark">{stats.activeDeliveries || 0}</h4>
            </div>
          </div>
        </div>

        {/* Active Rentals */}
        <div className="col-sm-6 col-lg-3">
          <div className="kpi-card">
            <div className="kpi-icon-wrapper bg-primary-subtle text-primary">
              <Clock size={24} />
            </div>
            <div>
              <span className="text-muted small d-block">ACTIVE RENTALS</span>
              <h4 className="fw-bold mb-0 text-dark">{stats.activeRentals || 0}</h4>
            </div>
          </div>
        </div>

        {/* Pending Return Pickups */}
        <div className="col-sm-6 col-lg-3">
          <div className="kpi-card">
            <div className="kpi-icon-wrapper bg-warning-subtle text-warning">
              <RotateCcw size={24} />
            </div>
            <div>
              <span className="text-muted small d-block">PENDING RETURNS</span>
              <h4 className="fw-bold mb-0 text-dark">{stats.pendingReturnPickups || 0}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <h5 className="fw-bold text-dark mb-3">Management Modules</h5>
      <div className="row g-3 mb-5">
        <div className="col-md-4 col-sm-6">
          <Link to="/admin/books" className="text-decoration-none">
            <div className="surface-card p-3 h-100 d-flex align-items-center justify-content-between hover-shadow">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-success text-white rounded">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0">Manage Books</h6>
                  <small className="text-muted">{stats.totalBooks || 0} Books in Catalogue</small>
                </div>
              </div>
              <ArrowRight size={16} className="text-muted" />
            </div>
          </Link>
        </div>

        <div className="col-md-4 col-sm-6">
          <Link to="/admin/delivery-boys" className="text-decoration-none">
            <div className="surface-card p-3 h-100 d-flex align-items-center justify-content-between hover-shadow">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-info text-white rounded">
                  <Truck size={20} />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0">Delivery Boys</h6>
                  <small className="text-muted">{stats.totalDeliveryBoys || 0} Active Agents</small>
                </div>
              </div>
              <ArrowRight size={16} className="text-muted" />
            </div>
          </Link>
        </div>

        <div className="col-md-4 col-sm-6">
          <Link to="/admin/deliveries" className="text-decoration-none">
            <div className="surface-card p-3 h-100 d-flex align-items-center justify-content-between hover-shadow">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-primary text-white rounded">
                  <Package size={20} />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0">Manage Deliveries</h6>
                  <small className="text-muted">Assign & Track Tasks</small>
                </div>
              </div>
              <ArrowRight size={16} className="text-muted" />
            </div>
          </Link>
        </div>

        <div className="col-md-4 col-sm-6">
          <Link to="/admin/orders" className="text-decoration-none">
            <div className="surface-card p-3 h-100 d-flex align-items-center justify-content-between hover-shadow">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-secondary text-white rounded">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0">Purchase Orders</h6>
                  <small className="text-muted">{stats.totalOrders || 0} Total Orders</small>
                </div>
              </div>
              <ArrowRight size={16} className="text-muted" />
            </div>
          </Link>
        </div>

        <div className="col-md-4 col-sm-6">
          <Link to="/admin/rentals" className="text-decoration-none">
            <div className="surface-card p-3 h-100 d-flex align-items-center justify-content-between hover-shadow">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-warning text-dark rounded">
                  <Clock size={20} />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0">Manage Rentals</h6>
                  <small className="text-muted">{stats.totalRentals || 0} Rentals Logged</small>
                </div>
              </div>
              <ArrowRight size={16} className="text-muted" />
            </div>
          </Link>
        </div>

        <div className="col-md-4 col-sm-6">
          <Link to="/admin/payments" className="text-decoration-none">
            <div className="surface-card p-3 h-100 d-flex align-items-center justify-content-between hover-shadow">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-dark text-white rounded">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0">Payment Records</h6>
                  <small className="text-muted">COD & Razorpay Audits</small>
                </div>
              </div>
              <ArrowRight size={16} className="text-muted" />
            </div>
          </Link>
        </div>
      </div>

      {/* Tables Row: Recent Orders & Recent Deliveries */}
      <div className="row g-4">
        {/* Recent Orders */}
        <div className="col-lg-6">
          <div className="surface-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-dark mb-0">Recent Purchase Orders</h6>
              <Link to="/admin/orders" className="small text-success text-decoration-none">
                View all &rarr;
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle mb-0">
                <thead>
                  <tr className="text-muted small">
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-3 text-muted">No orders placed yet</td>
                    </tr>
                  ) : (
                    recentOrders.map((ord) => (
                      <tr key={ord._id}>
                        <td>
                          <strong>#{ord.orderNumber.substring(0, 14)}...</strong>
                        </td>
                        <td>{ord.user ? ord.user.name : ord.customerName}</td>
                        <td className="fw-semibold text-success">₹{ord.totalAmount}</td>
                        <td>
                          <span className={`badge status-badge-${ord.orderStatus} small`}>
                            {ord.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Deliveries */}
        <div className="col-lg-6">
          <div className="surface-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-dark mb-0">Recent Delivery Tasks</h6>
              <Link to="/admin/deliveries" className="small text-primary text-decoration-none">
                View all &rarr;
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle mb-0">
                <thead>
                  <tr className="text-muted small">
                    <th>Delivery #</th>
                    <th>Type</th>
                    <th>Agent</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {recentDeliveries.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-3 text-muted">No delivery tasks created</td>
                    </tr>
                  ) : (
                    recentDeliveries.map((del) => (
                      <tr key={del._id}>
                        <td>
                          <strong>#{del.deliveryNumber.substring(0, 14)}...</strong>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border small">{del.type}</span>
                        </td>
                        <td>{del.assignedDeliveryBoy ? del.assignedDeliveryBoy.name : <em className="text-muted">Unassigned</em>}</td>
                        <td>
                          <span className={`badge status-badge-${del.status} small`}>
                            {del.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
