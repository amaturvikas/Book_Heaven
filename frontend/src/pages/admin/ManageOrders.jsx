import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, Eye, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/orders/admin/all', { params });
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/admin/${orderId}/status`, { orderStatus: newStatus });
      setFeedback({ type: 'success', text: `Order status updated to ${newStatus}.` });
      fetchOrders();
    } catch (err) {
      setFeedback({ type: 'danger', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const filtered = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (o.shippingAddress && o.shippingAddress.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark brand-font mb-0">Customer Purchase Orders</h2>
          <span className="text-muted small">Monitor purchase fulfillment, payments, and dispatching</span>
        </div>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} py-2 mb-3 small`}>
          {feedback.text}
        </div>
      )}

      {/* Search and Filters */}
      <div className="surface-card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-8">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search orders by order #, customer name, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Order Statuses</option>
              <option value="Placed">Placed</option>
              <option value="Processing">Processing</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="surface-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="small text-muted">
                <th>Order #</th>
                <th>Customer</th>
                <th>Items Summary</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th className="text-end">Manage</th>
              </tr>
            </thead>
            <tbody className="small">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">Loading purchase orders...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No purchase orders found.</td>
                </tr>
              ) : (
                filtered.map((ord) => (
                  <tr key={ord._id}>
                    <td>
                      <strong className="text-dark d-block">#{ord.orderNumber}</strong>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <strong className="text-dark d-block">{ord.customerName}</strong>
                      <span className="text-muted">{ord.customerPhone}</span>
                    </td>
                    <td>
                      <span className="d-block text-truncate" style={{ maxWidth: '200px' }}>
                        {ord.items.map((i) => `${i.title} (x${i.quantity})`).join(', ')}
                      </span>
                      <small className="text-muted">{ord.items.length} unique book(s)</small>
                    </td>
                    <td className="fw-bold text-success">₹{ord.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {ord.paymentMethod}
                      </span>
                      <span className={`badge ms-1 ${ord.paymentStatus === 'Completed' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge status-badge-${ord.orderStatus} px-2 py-1`}>
                        {ord.orderStatus}
                      </span>
                      {ord.orderStatus === 'Cancelled' && ord.cancellationReason && (
                        <small className="text-danger d-block mt-1" style={{ fontSize: '0.7rem' }}>
                          Reason: {ord.cancellationReason}
                        </small>
                      )}
                    </td>
                    <td className="text-end">
                      <select
                        className="form-select form-select-sm d-inline-block w-auto"
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                      >
                        <option value="Placed">Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageOrders;
