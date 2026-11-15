import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, AlertTriangle, Truck, ArrowRight, RotateCcw, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedulingId, setSchedulingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [cancellingRental, setCancellingRental] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rentals/my-rentals');
      if (res.data.success) {
        setRentals(res.data.rentals);
      }
    } catch (err) {
      console.error('Failed to load rentals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleRequestReturn = async (rentalId) => {
    try {
      setSchedulingId(rentalId);
      const res = await api.post(`/rentals/${rentalId}/request-return`);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          text: 'Doorstep return pickup requested! A delivery agent will be assigned to collect the book.'
        });
        fetchRentals();
      }
    } catch (err) {
      setFeedback({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to request return pickup.'
      });
    } finally {
      setSchedulingId(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleCancelRental = async () => {
    if (!cancellingRental) return;
    try {
      setCancelling(true);
      const res = await api.patch(`/rentals/${cancellingRental._id}/cancel`, {
        reason: cancelReason || 'Cancelled by customer'
      });
      if (res.data.success) {
        setFeedback({
          type: 'success',
          text: `Rental booking #${cancellingRental.rentalNumber} was cancelled. Inventory has been restored!`
        });
        setCancellingRental(null);
        setCancelReason('');
        fetchRentals();
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

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const diffTime = new Date(dueDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark brand-font mb-0">My Book Rentals</h2>
          <span className="text-muted small">Manage rental durations, due dates, cancellations, and return pickups</span>
        </div>
        <Link to="/my-orders" className="btn btn-outline-custom btn-sm">
          &larr; View Purchases
        </Link>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} py-2 mb-4 small d-flex align-items-center gap-2`}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <div className="text-muted small mt-2">Loading your rentals...</div>
        </div>
      ) : rentals.length === 0 ? (
        <div className="text-center py-5 surface-card my-4">
          <Clock size={52} className="text-muted mb-3" />
          <h4 className="fw-bold text-dark mb-2">No active book rentals</h4>
          <p className="text-muted small mb-3">You can rent any book in our catalogue by the day.</p>
          <Link to="/books" className="btn btn-primary-custom">
            Browse Books to Rent
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {rentals.map((rental) => {
            const daysLeft = getDaysRemaining(rental.dueDate);
            const isOverdue = daysLeft !== null && daysLeft < 0 && rental.status !== 'Returned' && rental.status !== 'Cancelled';
            const isNearDue = daysLeft !== null && daysLeft <= 2 && daysLeft >= 0 && rental.status === 'Active';
            const isCancellable = rental.status === 'PendingDelivery';
            const canReturn = ['Active', 'Due', 'Overdue'].includes(rental.status) && !rental.returnDelivery;
            const hasReturnScheduled = !!rental.returnDelivery || ['ReturnScheduled', 'ReturnCollected', 'Returned'].includes(rental.status);

            return (
              <div key={rental._id} className="surface-card p-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 border-bottom mb-3">
                  <div>
                    <span className="text-muted small d-block">RENTAL NUMBER</span>
                    <strong className="text-dark fs-6">#{rental.rentalNumber}</strong>
                    <span className="text-muted small ms-2">
                      Booked on {new Date(rental.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className={`badge rental-badge-${rental.status} px-3 py-2 rounded-pill font-weight-bold`}>
                      {rental.status}
                    </span>

                    {/* Return status badge indicator */}
                    {rental.status === 'ReturnScheduled' && (
                      <span className="badge bg-warning-subtle text-dark border px-2 py-1 small d-flex align-items-center gap-1">
                        <RotateCcw size={12} /> Return Pickup Scheduled
                      </span>
                    )}

                    {rental.status === 'ReturnCollected' && (
                      <span className="badge bg-info-subtle text-info border px-2 py-1 small d-flex align-items-center gap-1">
                        <Truck size={12} /> Book Collected (In Transit to Warehouse)
                      </span>
                    )}

                    {rental.status === 'Returned' && (
                      <span className="badge bg-success-subtle text-success border px-2 py-1 small d-flex align-items-center gap-1">
                        <CheckCircle2 size={12} /> Returned & Verified (Stock Restored)
                      </span>
                    )}

                    {isOverdue && (
                      <span className="badge bg-danger text-white px-2 py-1 small d-flex align-items-center gap-1">
                        <AlertTriangle size={12} /> Overdue by {Math.abs(daysLeft)} days
                      </span>
                    )}
                    {isNearDue && (
                      <span className="badge bg-warning text-dark px-2 py-1 small">
                        Due in {daysLeft} day(s)
                      </span>
                    )}
                  </div>
                </div>

                {rental.status === 'Cancelled' && (
                  <div className="alert alert-danger py-2 px-3 small mb-3 d-flex align-items-center gap-2">
                    <XCircle size={16} />
                    <span>
                      <strong>Rental Cancelled:</strong> Booking was cancelled before delivery. Store inventory has been restored.
                    </span>
                  </div>
                )}

                <div className="row g-3 align-items-center">
                  <div className="col-md-7">
                    <h5 className="fw-bold text-dark mb-1">{rental.bookSnapshot.title}</h5>
                    <div className="small text-muted mb-2">Author: {rental.bookSnapshot.author}</div>
                    <div className="d-flex flex-wrap gap-3 small text-secondary">
                      <span>Duration: <strong>{rental.rentalDays} Days</strong></span>
                      <span>Rate: <strong>₹{rental.dailyFee}/day</strong></span>
                      {rental.dueDate && (
                        <span>Due Date: <strong>{new Date(rental.dueDate).toLocaleDateString()}</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="col-md-5 text-md-end border-start-md pt-3 pt-md-0">
                    <span className="text-muted small d-block">TOTAL RENTAL FEE</span>
                    <div className="fw-bold fs-5 text-primary mb-2">
                      ₹{rental.totalPaid.toFixed(2)}
                    </div>

                    <div className="d-flex justify-content-md-end gap-2 flex-wrap">
                      {/* Cancel Rental Button */}
                      {isCancellable && (
                        <button
                          onClick={() => setCancellingRental(rental)}
                          className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1"
                          title="Cancel this rental booking before dispatch"
                        >
                          <XCircle size={14} />
                          <span>Cancel Rental</span>
                        </button>
                      )}

                      {/* Schedule / Request Return Pickup Button */}
                      {canReturn && (
                        <button
                          onClick={() => handleRequestReturn(rental._id)}
                          disabled={schedulingId === rental._id}
                          className="btn btn-warning btn-sm fw-bold d-inline-flex align-items-center gap-1"
                        >
                          {schedulingId === rental._id ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            <>
                              <RotateCcw size={14} />
                              <span>Return Book</span>
                            </>
                          )}
                        </button>
                      )}

                      <Link
                        to={`/my-rentals/${rental._id}`}
                        className="btn btn-outline-custom btn-sm d-inline-flex align-items-center gap-1"
                      >
                        <Truck size={14} className="text-primary" />
                        <span>Tracking & Details</span>
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

      {/* Cancel Rental Modal */}
      {cancellingRental && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <XCircle size={20} className="text-danger" /> Cancel Rental #{cancellingRental.rentalNumber}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setCancellingRental(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="small text-secondary mb-3">
                  Are you sure you want to cancel the rental for <strong>"{cancellingRental.bookSnapshot.title}"</strong>?
                  The delivery task will be stopped and this book copy will be immediately returned to available store stock.
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
                  onClick={() => setCancellingRental(null)}
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

export default MyRentals;
