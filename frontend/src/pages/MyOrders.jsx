import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Truck, ArrowRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const location = useLocation();
  const isSuccess = new URLSearchParams(location.search).get('success') === 'order_placed';

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;
    try {
      setCancelling(true);
      const res = await api.patch(`/orders/${cancellingOrder._id}/cancel`, {
        reason: cancelReason || 'Cancelled by customer'
      });
      if (res.data.success) {
        setFeedback({
          type: 'success',
          text: `Order #${cancellingOrder.orderNumber} was successfully cancelled. Available inventory has been restored!`
        });
        setCancellingOrder(null);
        setCancelReason('');
        fetchOrders();
      }
    } catch (err) {
      setFeedback({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to cancel order.'
      });
    } finally {
      setCancelling(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <div className="container py-4">
      {isSuccess && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4 p-3 shadow-sm border-0">
          <CheckCircle2 size={24} className="text-success flex-shrink-0" />
          <div>
            <strong>Thank you for your order!</strong> Your order has been placed and is now queued for delivery assignment.
          </div>
        </div>
      )}

      {feedback && (
        <div className={`alert alert-${feedback.type} mb-4 small d-flex align-items-center gap-2`}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark brand-font mb-0">My Purchases & Orders</h2>
          <span className="text-muted small">View order progress, cancel pending items, and live tracking</span>
        </div>
        <Link to="/my-rentals" className="btn btn-outline-custom btn-sm">
          View Book Rentals &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
          <div className="text-muted small mt-2">Loading your orders...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-5 surface-card my-4">
          <Package size={52} className="text-muted mb-3" />
          <h4 className="fw-bold text-dark mb-2">No orders placed yet</h4>
          <p className="text-muted small mb-3">Explore our local catalogue to purchase physical books.</p>
          <Link to="/books" className="btn btn-primary-custom">
            Browse Catalogue
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => {
            const isCancellable = ['Placed', 'Processing'].includes(order.orderStatus);

            return (
              <div key={order._id} className="surface-card p-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 border-bottom mb-3">
                  <div>
                    <span className="text-muted small d-block">ORDER NUMBER</span>
                    <strong className="text-dark fs-6">#{order.orderNumber}</strong>
                    <span className="text-muted small ms-2">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`badge status-badge-${order.orderStatus} px-3 py-2 rounded-pill font-weight-bold`}>
                      {order.orderStatus}
                    </span>
                    <span className="badge bg-light text-dark border">
                      {order.paymentMethod} ({order.paymentStatus})
                    </span>
                  </div>
                </div>

                {order.orderStatus === 'Cancelled' && (
                  <div className="alert alert-danger py-2 px-3 small mb-3 d-flex align-items-center gap-2">
                    <XCircle size={16} />
                    <span>
                      <strong>Cancelled:</strong> {order.cancellationReason || 'Order cancelled upon request.'} Stock was restored to inventory.
                    </span>
                  </div>
                )}

                {/* Items in order */}
                <div className="row g-3 align-items-center">
                  <div className="col-md-8">
                    <div className="d-flex flex-column gap-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="small d-flex align-items-center justify-content-between">
                          <span>
                            <strong>{item.title}</strong> x {item.quantity}
                          </span>
                          <span className="text-muted">₹{item.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-md-4 text-md-end border-start-md pt-3 pt-md-0">
                    <span className="text-muted small d-block">TOTAL AMOUNT</span>
                    <div className="fw-bold fs-5 text-success mb-2">
                      ₹{order.totalAmount.toFixed(2)}
                    </div>
                    <div className="d-flex justify-content-md-end gap-2 flex-wrap">
                      {isCancellable && (
                        <button
                          onClick={() => setCancellingOrder(order)}
                          className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1"
                        >
                          <XCircle size={14} />
                          <span>Cancel Order</span>
                        </button>
                      )}
                      <Link
                        to={`/my-orders/${order._id}`}
                        className="btn btn-outline-custom btn-sm d-inline-flex align-items-center gap-1"
                      >
                        <Truck size={14} className="text-primary" />
                        <span>Track Delivery</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancellingOrder && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <XCircle size={20} className="text-danger" /> Cancel Order #{cancellingOrder.orderNumber}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setCancellingOrder(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="small text-secondary mb-3">
                  Are you sure you want to cancel this order? Once cancelled, the delivery task will be stopped and all books will be automatically restored to store stock.
                </p>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Reason for Cancellation (Optional)
                  </label>
                  <select
                    className="form-select form-select-sm mb-2"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  >
                    <option value="">Select a common reason...</option>
                    <option value="Changed mind / No longer needed">Changed mind / No longer needed</option>
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Found better alternative">Found better alternative</option>
                    <option value="Incorrect shipping address entered">Incorrect shipping address entered</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Or type specific reason here..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-custom btn-sm"
                  onClick={() => setCancellingOrder(null)}
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  disabled={cancelling}
                  className="btn btn-danger btn-sm fw-bold d-flex align-items-center gap-1"
                  onClick={handleCancelOrder}
                >
                  {cancelling ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <>
                      <XCircle size={15} />
                      <span>Confirm Cancellation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
