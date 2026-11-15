import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Package, MapPin, Phone, CheckCircle2, AlertTriangle, XCircle, RotateCcw } from 'lucide-react';
import api from '../../services/api';
import DeliveryTimeline from '../../components/DeliveryTimeline';

const DeliveryBoyDeliveryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Delivered Modal Form
  const [recipientName, setRecipientName] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Failed Modal Form
  const [showFailModal, setShowFailModal] = useState(false);
  const [failureReason, setFailureReason] = useState('Customer door locked and phone unreachable');
  const [failureNotes, setFailureNotes] = useState('');

  const fetchDelivery = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/deliveries/delivery-boy/${id}`);
      if (res.data.success) {
        setDelivery(res.data.delivery);
        setRecipientName(res.data.delivery.customerName || '');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Access denied or delivery record not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelivery();
  }, [id]);

  const handleUpdateStatus = async (nextStatus, extra = {}) => {
    try {
      setUpdating(true);
      const res = await api.patch(`/deliveries/delivery-boy/${id}/status`, {
        status: nextStatus,
        ...extra
      });
      if (res.data.success) {
        setFeedback({ type: 'success', text: `Status updated to ${nextStatus}!` });
        setShowFailModal(false);
        fetchDelivery();
      }
    } catch (err) {
      setFeedback({ type: 'danger', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setUpdating(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-info" role="status"></div>
        <div className="text-muted small mt-2">Loading task details...</div>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger d-inline-block px-4 py-2">
          {error || 'Task not found.'}
        </div>
        <div>
          <Link to="/delivery-boy/my-deliveries" className="btn btn-outline-custom mt-3">
            <ArrowLeft size={16} /> Back to My Deliveries
          </Link>
        </div>
      </div>
    );
  }

  const isReturn = delivery.type === 'RentalReturnPickup';

  return (
    <div className="container py-4">
      <Link to="/delivery-boy/my-deliveries" className="btn btn-outline-custom btn-sm mb-4 d-inline-flex align-items-center gap-1">
        <ArrowLeft size={15} /> Back to My Deliveries
      </Link>

      {feedback && (
        <div className={`alert alert-${feedback.type} mb-4 small`}>
          {feedback.text}
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <span className="text-muted small">TASK #{delivery.deliveryNumber}</span>
          <h3 className="fw-bold text-dark brand-font mb-0">
            {isReturn ? 'Rental Return Pickup Task' : delivery.type}
          </h3>
        </div>
        <div className="d-flex align-items-center gap-2">
          {isReturn && (
            <span className="badge bg-warning-subtle text-dark border px-2 py-1 small">
              Return Task
            </span>
          )}
          <span className={`badge status-badge-${delivery.status} px-3 py-2 rounded-pill font-weight-bold fs-6`}>
            {delivery.status}
          </span>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Action Control Panel */}
        <div className="col-lg-6">
          <div className="surface-card p-4 mb-4">
            <h5 className="fw-bold text-dark mb-3">Field Action Controls</h5>

            {/* If Assigned -> Button: Picked Up */}
            {delivery.status === 'Assigned' && (
              <div className="d-grid gap-2">
                <p className="text-secondary small mb-2">
                  {isReturn
                    ? 'Return pickup has been assigned to you. When you reach customer location and collect the book, click below:'
                    : 'Package has been assigned to you. Acknowledge when you collect the parcel from the fulfillment center.'}
                </p>
                <button
                  onClick={() =>
                    handleUpdateStatus(
                      'PickedUp',
                      { notes: isReturn ? 'Collected rental book from customer address.' : 'Collected parcel from warehouse.' }
                    )
                  }
                  disabled={updating}
                  className="btn btn-primary-custom py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                >
                  {isReturn ? <RotateCcw size={18} /> : <Package size={18} />}
                  <span>{isReturn ? 'Confirm Collected from Customer' : 'Mark as Picked Up'}</span>
                </button>
              </div>
            )}

            {/* If PickedUp -> Button: Out for Delivery */}
            {delivery.status === 'PickedUp' && (
              <div className="d-grid gap-2">
                <p className="text-secondary small mb-2">
                  {isReturn
                    ? 'Book is in your possession. Mark below when you start transporting it to Book Heaven Central Warehouse:'
                    : 'Package is with you. Mark "Out for Delivery" when you start heading to the customer\'s doorstep.'}
                </p>
                <button
                  onClick={() =>
                    handleUpdateStatus(
                      'OutForDelivery',
                      { notes: isReturn ? 'Agent is en route to warehouse with returned book.' : 'Rider is en route to customer.' }
                    )
                  }
                  disabled={updating}
                  className="btn btn-primary-custom py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                >
                  <Truck size={18} />
                  <span>{isReturn ? 'Mark In Transit to Warehouse' : 'Mark Out for Delivery'}</span>
                </button>
              </div>
            )}

            {/* If OutForDelivery -> Buttons: Delivered OR Failed */}
            {delivery.status === 'OutForDelivery' && (
              <div>
                <p className="text-secondary small mb-3">
                  {isReturn
                    ? 'You have arrived at the central warehouse. Record return handover below:'
                    : 'You are currently delivering this package. Record the delivery outcome below:'}
                </p>

                <div className="border rounded-3 p-3 bg-light mb-3">
                  <h6 className="fw-bold text-success mb-2">
                    {isReturn ? 'Confirm Warehouse Deposit' : 'Successful Delivery'}
                  </h6>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-secondary">
                      {isReturn ? 'Received By (Warehouse Staff Name)' : 'Recipient Name Confirmation'}
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder={isReturn ? 'e.g. Warehouse Receiver / Staff' : 'Name of recipient'}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Task Notes</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder={isReturn ? 'e.g. Deposited book in good condition' : 'e.g. Handed to customer at door'}
                    />
                  </div>
                  <button
                    onClick={() =>
                      handleUpdateStatus('Delivered', {
                        notes: deliveryNotes || (isReturn ? 'Returned book deposited at warehouse.' : 'Package delivered successfully.'),
                        proofOfDelivery: {
                          recipientName: recipientName || (isReturn ? 'Warehouse Staff' : delivery.customerName),
                          notes: deliveryNotes
                        }
                      })
                    }
                    disabled={updating}
                    className="btn btn-success w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    <span>{isReturn ? 'Confirm Deposited at Warehouse (Return Collected)' : 'Confirm Successful Delivery'}</span>
                  </button>
                </div>

                <div className="d-grid">
                  <button
                    onClick={() => setShowFailModal(true)}
                    className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center gap-1"
                  >
                    <XCircle size={15} />
                    <span>Report {isReturn ? 'Return Pickup' : 'Delivery'} Attempt Failed</span>
                  </button>
                </div>
              </div>
            )}

            {/* If Delivered or Failed */}
            {['Delivered', 'Failed'].includes(delivery.status) && (
              <div className="alert alert-light border text-center py-3 mb-0">
                <CheckCircle2 size={32} className={delivery.status === 'Delivered' ? 'text-success mb-2' : 'text-danger mb-2'} />
                <h6 className="fw-bold mb-1">Task Completed with status: {delivery.status}</h6>
                {isReturn && delivery.status === 'Delivered' && (
                  <p className="text-success small mb-0">
                    Book has been collected and deposited at warehouse. Return status is <strong>ReturnCollected</strong>. Administrator will inspect condition and finalize stock restoration.
                  </p>
                )}
                {delivery.failureReason && (
                  <p className="text-danger small mb-0">Reason: {delivery.failureReason}</p>
                )}
              </div>
            )}
          </div>

          {/* Customer Address and Call Box */}
          <div className="surface-card p-4">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <MapPin size={18} className="text-danger" /> {isReturn ? 'Customer Collection Point' : 'Customer Contact & Destination'}
            </h6>

            <div className="mb-3">
              <strong className="text-dark d-block fs-6">{delivery.customerName}</strong>
              <div className="text-secondary small mt-1">
                {isReturn ? (
                  <>
                    <strong>Pickup Address:</strong> {delivery.pickupLocation}<br />
                    <strong>Deposit Warehouse:</strong> {delivery.deliveryAddress.street}, {delivery.deliveryAddress.city} - {delivery.deliveryAddress.zipCode}
                  </>
                ) : (
                  <>
                    {delivery.deliveryAddress.street}<br />
                    {delivery.deliveryAddress.city}, {delivery.deliveryAddress.state} - {delivery.deliveryAddress.zipCode}
                  </>
                )}
              </div>
            </div>

            <div className="d-grid">
              <a
                href={`tel:${delivery.customerPhone}`}
                className="btn btn-outline-success d-flex align-items-center justify-content-center gap-2"
              >
                <Phone size={18} />
                <span>Call Customer: {delivery.customerPhone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Items and Timeline */}
        <div className="col-lg-6">
          <div className="surface-card p-4 mb-4">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Package size={18} className="text-success" /> {isReturn ? 'Books to Collect & Return' : 'Books to Deliver'}
            </h6>
            <div className="d-flex flex-column gap-2">
              {delivery.items.map((item, idx) => (
                <div key={idx} className="d-flex justify-content-between align-items-center small py-2 border-bottom">
                  <strong>{item.title}</strong>
                  <span className="badge bg-light text-dark border">Qty: {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <DeliveryTimeline delivery={delivery} />
        </div>
      </div>

      {/* Failure Reason Modal */}
      {showFailModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-danger d-flex align-items-center gap-2">
                  <AlertTriangle size={20} /> Record Failed {isReturn ? 'Return Pickup' : 'Delivery'} Attempt
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowFailModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="small text-secondary mb-3">
                  A specific, verified reason is mandatory when reporting a failed attempt.
                </p>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Specific Reason *</label>
                  <select
                    className="form-select"
                    value={failureReason}
                    onChange={(e) => setFailureReason(e.target.value)}
                    required
                  >
                    <option value="Customer door locked and phone unreachable">
                      Customer door locked and phone unreachable
                    </option>
                    <option value="Customer not available at specified address">
                      Customer not available at specified address
                    </option>
                    <option value="Customer requested to reschedule collection">
                      Customer requested to reschedule collection
                    </option>
                    <option value="Book not ready for return">
                      Book not ready for return
                    </option>
                    <option value="Incorrect address provided">
                      Incorrect address provided
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Rider Remarks</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter additional remarks..."
                    value={failureNotes}
                    onChange={(e) => setFailureNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer border-top">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowFailModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updating}
                  className="btn btn-danger"
                  onClick={() =>
                    handleUpdateStatus('Failed', {
                      failureReason,
                      notes: failureNotes
                    })
                  }
                >
                  {updating ? 'Saving...' : 'Submit Failed Attempt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryBoyDeliveryDetails;
