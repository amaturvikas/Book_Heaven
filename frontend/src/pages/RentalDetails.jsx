import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Truck, RotateCcw, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import api from '../services/api';
import DeliveryTimeline from '../components/DeliveryTimeline';

const RentalDetails = () => {
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchRental = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/rentals/${id}`);
      if (res.data.success) {
        setRental(res.data.rental);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rental details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRental();
  }, [id]);

  const handleRequestReturn = async () => {
    try {
      setRequesting(true);
      const res = await api.post(`/rentals/${id}/request-return`);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          text: 'Doorstep return pickup requested! Our agent will contact you for pickup.'
        });
        fetchRental();
      }
    } catch (err) {
      setFeedback({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to request return pickup.'
      });
    } finally {
      setRequesting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleCancelRental = async () => {
    try {
      setCancelling(true);
      const res = await api.patch(`/rentals/${id}/cancel`, {
        reason: cancelReason || 'Cancelled by customer'
      });
      if (res.data.success) {
        setFeedback({
          type: 'success',
          text: 'Rental booking successfully cancelled. Available inventory has been restored.'
        });
        setShowCancelModal(false);
        setCancelReason('');
        fetchRental();
      }
    } catch (err) {
      setFeedback({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to cancel rental.'
      });
    } finally {
      setCancelling(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="text-muted small mt-2">Loading rental tracking data...</div>
      </div>
    );
  }

  if (error || !rental) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger d-inline-block px-4 py-2">
          {error || 'Rental record not found.'}
        </div>
        <div>
          <Link to="/my-rentals" className="btn btn-outline-custom mt-3">
            <ArrowLeft size={16} /> Back to My Rentals
          </Link>
        </div>
      </div>
    );
  }

  const isCancellable = rental.status === 'PendingDelivery';
  const canReturn = ['Active', 'Due', 'Overdue'].includes(rental.status) && !rental.returnDelivery;

  return (
    <div className="container py-4">
      <Link to="/my-rentals" className="btn btn-outline-custom btn-sm mb-4 d-inline-flex align-items-center gap-1">
        <ArrowLeft size={15} /> Back to My Rentals
      </Link>

      {feedback && (
        <div className={`alert alert-${feedback.type} mb-4 small d-flex align-items-center gap-2`}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <span className="text-muted small">RENTAL DETAILS</span>
          <h3 className="fw-bold text-dark brand-font mb-0">#{rental.rentalNumber}</h3>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className={`badge rental-badge-${rental.status} px-3 py-2 rounded-pill font-weight-bold`}>
            Status: {rental.status}
          </span>
          <span className="badge bg-light text-dark border">
            {rental.paymentMethod} ({rental.paymentStatus})
          </span>
          {isCancellable && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1 ms-2"
            >
              <XCircle size={15} />
              <span>Cancel Rental</span>
            </button>
          )}
          {canReturn && (
            <button
              onClick={handleRequestReturn}
              disabled={requesting}
              className="btn btn-warning btn-sm fw-bold d-inline-flex align-items-center gap-1 ms-2"
            >
              <RotateCcw size={15} />
              <span>Return Book</span>
            </button>
          )}
        </div>
      </div>

      {rental.status === 'Cancelled' && (
        <div className="alert alert-danger p-3 mb-4 d-flex align-items-center gap-2 rounded-3 shadow-sm">
          <XCircle size={22} className="flex-shrink-0" />
          <div>
            <strong className="d-block">This rental booking was cancelled.</strong>
            <span className="small">
              The initial delivery was stopped and the book has been returned to available store stock.
            </span>
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Delivery & Return Tracking */}
        <div className="col-lg-7">
          {/* Return Pickup Section */}
          {rental.returnDelivery ? (
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <RotateCcw size={20} className="text-warning" /> Return Pickup Delivery Tracking
                </h5>
                <span className="badge bg-warning-subtle text-dark border">
                  Return Status: {rental.returnDelivery.status}
                </span>
              </div>
              <DeliveryTimeline delivery={rental.returnDelivery} />
            </div>
          ) : canReturn ? (
            <div className="surface-card p-4 mb-4 border-warning bg-warning-subtle bg-opacity-10">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <h6 className="fw-bold text-dark mb-1">Ready to return this book?</h6>
                  <p className="small text-secondary mb-0">
                    Schedule a free doorstep return pickup. A Book Heaven delivery agent will collect the book from your address and transport it back to our warehouse.
                  </p>
                </div>
                <button
                  onClick={handleRequestReturn}
                  disabled={requesting}
                  className="btn btn-warning btn-sm fw-bold d-inline-flex align-items-center gap-1"
                >
                  {requesting ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <>
                      <RotateCcw size={15} />
                      <span>Request Return Pickup</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}

          {/* Initial Outbound Delivery Timeline */}
          <div>
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Truck size={20} className="text-primary" /> Outbound Delivery Tracking
            </h5>
            {rental.delivery ? (
              <DeliveryTimeline delivery={rental.delivery} />
            ) : (
              <div className="surface-card p-4 text-center text-muted">
                Initial delivery tracking pending.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Book & Policy Summary */}
        <div className="col-lg-5">
          <div className="surface-card p-4">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Clock size={20} className="text-primary" /> Rental Summary
            </h5>

            <div className="d-flex align-items-center gap-3 pb-3 border-bottom mb-3">
              <img
                src={rental.bookSnapshot.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'}
                alt={rental.bookSnapshot.title}
                className="rounded border"
                style={{ width: '60px', height: '80px', objectFit: 'cover' }}
              />
              <div>
                <h6 className="fw-bold mb-1">{rental.bookSnapshot.title}</h6>
                <div className="small text-muted">{rental.bookSnapshot.author}</div>
                <div className="small text-success">Qty: {rental.quantity} copy/copies</div>
              </div>
            </div>

            <div className="d-flex justify-content-between py-2 border-bottom small">
              <span className="text-muted">Rental Duration:</span>
              <span className="fw-bold text-dark">{rental.rentalDays} Days</span>
            </div>

            <div className="d-flex justify-content-between py-2 border-bottom small">
              <span className="text-muted">Daily Rate:</span>
              <span className="fw-bold text-dark">₹{rental.dailyFee}/day</span>
            </div>

            <div className="d-flex justify-content-between py-2 border-bottom small">
              <span className="text-muted">Start Date:</span>
              <span className="fw-bold text-dark">
                {rental.startDate ? new Date(rental.startDate).toLocaleDateString() : 'Pending Delivery'}
              </span>
            </div>

            <div className="d-flex justify-content-between py-2 border-bottom small">
              <span className="text-muted">Due Date:</span>
              <span className="fw-bold text-danger">
                {rental.dueDate ? new Date(rental.dueDate).toLocaleDateString() : 'Calculated upon delivery'}
              </span>
            </div>

            {rental.returnDate && (
              <div className="d-flex justify-content-between py-2 border-bottom small">
                <span className="text-muted">Returned Date:</span>
                <span className="fw-bold text-success">
                  {new Date(rental.returnDate).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="d-flex justify-content-between py-3 mb-2">
              <strong className="fs-5 text-dark">Total Fee Paid:</strong>
              <strong className="fs-5 text-primary">₹{rental.totalPaid.toFixed(2)}</strong>
            </div>

            {/* Action buttons inside card */}
            <div className="d-grid gap-2 mb-3">
              {canReturn && (
                <button
                  onClick={handleRequestReturn}
                  disabled={requesting}
                  className="btn btn-warning btn-sm fw-bold d-flex align-items-center justify-content-center gap-1"
                >
                  <RotateCcw size={15} />
                  <span>Return This Book Now</span>
                </button>
              )}
              {isCancellable && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="btn btn-outline-danger btn-sm fw-bold d-flex align-items-center justify-content-center gap-1"
                >
                  <XCircle size={15} />
                  <span>Cancel Rental Booking</span>
                </button>
              )}
            </div>

            <div className="alert alert-light border small text-muted mb-0">
              <strong>Rental Return Policy:</strong> Return pickup can be initiated anytime during your active rental period. A delivery agent will collect the book directly from your doorstep and transport it to the Book Heaven warehouse.
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Rental Modal */}
      {showCancelModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <XCircle size={20} className="text-danger" /> Cancel Rental #{rental.rentalNumber}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCancelModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="small text-secondary mb-3">
                  Are you sure you want to cancel the rental for <strong>"{rental.bookSnapshot.title}"</strong>?
                  The delivery task will be stopped and this book copy will be returned to available store stock.
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
                    <option value="Rented by mistake">Rented by mistake</option>
                    <option value="Wanted to buy permanently instead">Wanted to buy permanently instead</option>
                    <option value="Address incorrect">Address incorrect</option>
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
                  Keep Rental
                </button>
                <button
                  type="button"
                  disabled={cancelling}
                  className="btn btn-danger btn-sm fw-bold d-flex align-items-center gap-1"
                  onClick={handleCancelRental}
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

export default RentalDetails;
