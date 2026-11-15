import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle2, MapPin, XCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import DeliveryTimeline from '../components/DeliveryTimeline';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const res = await api.patch(`/orders/${id}/cancel`, {
        reason: cancelReason || 'Cancelled by customer'
      });
      if (res.data.success) {
        setFeedback({
          type: 'success',
          text: 'Order successfully cancelled. Store inventory has been restored.'
        });
        setShowCancelModal(false);
        setCancelReason('');
        fetchOrder();
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

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-success" role="status"></div>
        <div className="text-muted small mt-2">Loading order and delivery data...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger d-inline-block px-4 py-2">
          {error || 'Order not found.'}
        </div>
        <div>
          <Link to="/my-orders" className="btn btn-outline-custom mt-3">
            <ArrowLeft size={16} /> Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const isCancellable = ['Placed', 'Processing'].includes(order.orderStatus);

  return (
    <div className="container py-4">
      <Link to="/my-orders" className="btn btn-outline-custom btn-sm mb-4 d-inline-flex align-items-center gap-1">
        <ArrowLeft size={15} /> Back to My Orders
      </Link>

      {feedback && (
        <div className={`alert alert-${feedback.type} mb-4 small d-flex align-items-center gap-2`}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <span className="text-muted small">ORDER DETAILS</span>
          <h3 className="fw-bold text-dark brand-font mb-0">#{order.orderNumber}</h3>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className={`badge status-badge-${order.orderStatus} px-3 py-2 rounded-pill font-weight-bold`}>
            Status: {order.orderStatus}
          </span>
          <span className="badge bg-light text-dark border">
            {order.paymentMethod} ({order.paymentStatus})
          </span>
          {isCancellable && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1 ms-2"
            >
              <XCircle size={15} />
              <span>Cancel Order</span>
            </button>
          )}
        </div>
      </div>

      {order.orderStatus === 'Cancelled' && (
        <div className="alert alert-danger p-3 mb-4 d-flex align-items-center gap-2 rounded-3 shadow-sm">
          <XCircle size={22} className="flex-shrink-0" />
          <div>
            <strong className="d-block">This order was cancelled.</strong>
            <span className="small">
              {order.cancellationReason ? `Reason: "${order.cancellationReason}". ` : ''}
              Associated deliveries were stopped and the book copies have been returned to available inventory.
            </span>
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Delivery Tracking Timeline */}
        <div className="col-lg-7">
          <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <Truck size={20} className="text-primary" /> Delivery Status & Tracking
          </h5>

          {order.delivery ? (
            <DeliveryTimeline delivery={order.delivery} />
          ) : (
            <div className="surface-card p-4 text-center text-muted">
              Delivery record being generated...
            </div>
          )}

          {/* Delivery Address Card */}
          <div className="surface-card p-4 mt-4">
            <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
              <MapPin size={18} className="text-danger" /> Delivery Address & Contact
            </h6>
            <div className="small text-secondary">
              <p className="mb-1 fw-bold text-dark">{order.customerName}</p>
              <p className="mb-1">{order.shippingAddress.street}</p>
              <p className="mb-1">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
              <p className="mb-0 text-muted">Phone: {order.customerPhone}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Order Items Summary */}
        <div className="col-lg-5">
          <div className="surface-card p-4">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Package size={20} className="text-success" /> Order Summary
            </h5>

            <div className="d-flex flex-column gap-3 pb-3 border-bottom mb-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0 fw-bold">{item.title}</h6>
                    <small className="text-muted">By {item.author} • Qty: {item.quantity}</small>
                  </div>
                  <strong className="text-dark small">₹{item.total.toFixed(2)}</strong>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-between py-2 border-bottom small">
              <span className="text-muted">Payment Method:</span>
              <span className="fw-bold text-dark">{order.paymentMethod}</span>
            </div>

            <div className="d-flex justify-content-between py-2 border-bottom small">
              <span className="text-muted">Payment Status:</span>
              <span className={`fw-bold ${order.paymentStatus === 'Completed' ? 'text-success' : 'text-warning'}`}>
                {order.paymentStatus}
              </span>
            </div>

            <div className="d-flex justify-content-between py-3 mb-2">
              <strong className="fs-5 text-dark">Total Paid:</strong>
              <strong className="fs-5 text-success">₹{order.totalAmount.toFixed(2)}</strong>
            </div>

            {isCancellable && (
              <div className="d-grid mb-3">
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="btn btn-outline-danger btn-sm fw-bold d-flex align-items-center justify-content-center gap-1"
                >
                  <XCircle size={15} />
                  <span>Cancel This Order</span>
                </button>
              </div>
            )}

            <div className="alert alert-light border small text-muted mb-0">
              Deliveries are handled by Book Heaven's designated field agents. For inquiries, refer to Order #{order.orderNumber}.
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <XCircle size={20} className="text-danger" /> Cancel Order #{order.orderNumber}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCancelModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="small text-secondary mb-3">
                  Are you sure you want to cancel this order? Once cancelled, the delivery task will be stopped and all items will be returned to store stock.
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
                  onClick={() => setShowCancelModal(false)}
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

export default OrderDetails;
