import React, { useState, useEffect } from 'react';
import { Clock, RotateCcw, CheckCircle2, AlertTriangle, Search, Filter, Truck, XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ManageRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState(null);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/rentals/admin/all', { params });
      if (res.data.success) {
        setRentals(res.data.rentals);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [statusFilter]);

  const handleSchedulePickup = async (rentalId) => {
    try {
      const res = await api.post(`/rentals/admin/${rentalId}/schedule-pickup`);
      if (res.data.success) {
        setFeedback({ type: 'success', text: 'Doorstep return pickup scheduled! Task added to dispatch queue.' });
        fetchRentals();
      }
    } catch (err) {
      setFeedback({ type: 'danger', text: err.response?.data?.message || 'Failed to schedule return pickup.' });
    } finally {
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleConfirmReturn = async (rentalId, bookTitle) => {
    if (!window.confirm(`Confirm physical return for "${bookTitle}"? This will officially restore stock in inventory.`)) return;

    try {
      const res = await api.patch(`/rentals/admin/${rentalId}/return`);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          text: `Physical return confirmed! Available stock restored to ${res.data.bookAvailableStock}.`
        });
        fetchRentals();
      }
    } catch (err) {
      setFeedback({ type: 'danger', text: err.response?.data?.message || 'Failed to confirm return.' });
    } finally {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const filtered = rentals.filter(
    (r) =>
      r.rentalNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.bookSnapshot.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark brand-font mb-0">Book Rental Operations</h2>
          <span className="text-muted small">Monitor active rentals, return pickup progression, and warehouse check-in</span>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/return-pickups" className="btn btn-warning btn-sm d-flex align-items-center gap-1">
            <RotateCcw size={14} />
            <span>Return Pickups Queue</span>
          </Link>
        </div>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} py-2 mb-3 small d-flex align-items-center gap-2`}>
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter and Search */}
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
                placeholder="Search by rental #, customer name, or book title..."
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
              <option value="">All Rental Statuses</option>
              <option value="PendingDelivery">Pending Delivery</option>
              <option value="Active">Active</option>
              <option value="Due">Due</option>
              <option value="Overdue">Overdue</option>
              <option value="ReturnScheduled">Return Scheduled</option>
              <option value="ReturnCollected">Return Collected (Field Agent Deposited)</option>
              <option value="Returned">Returned (Stock Restored)</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rentals Table */}
      <div className="surface-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="small text-muted">
                <th>Rental #</th>
                <th>Customer</th>
                <th>Book Details</th>
                <th>Duration & Rate</th>
                <th>Due Date</th>
                <th>Return Status & Lifecycle</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="small">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">Loading rentals...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No rental records found.</td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const isOverdue = r.dueDate && new Date(r.dueDate) < new Date() && !['Returned', 'Cancelled'].includes(r.status);
                  const returnDelivery = r.returnDelivery;

                  return (
                    <tr key={r._id}>
                      <td>
                        <strong className="text-dark d-block">#{r.rentalNumber}</strong>
                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <strong className="text-dark d-block">{r.customerName}</strong>
                        <span className="text-muted">{r.customerPhone}</span>
                      </td>
                      <td>
                        <strong className="text-dark d-block">{r.bookSnapshot.title}</strong>
                        <span className="text-muted">{r.bookSnapshot.author} • Qty: {r.quantity}</span>
                      </td>
                      <td>
                        <span className="d-block">{r.rentalDays} Days</span>
                        <strong className="text-primary">₹{r.totalPaid.toFixed(2)}</strong>
                      </td>
                      <td>
                        {r.dueDate ? (
                          <div>
                            <span className={isOverdue ? 'text-danger fw-bold' : 'text-dark'}>
                              {new Date(r.dueDate).toLocaleDateString()}
                            </span>
                            {isOverdue && (
                              <span className="badge bg-danger text-white d-block mt-1" style={{ fontSize: '0.65rem' }}>
                                OVERDUE
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">Calculates on delivery</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge rental-badge-${r.status} px-2 py-1`}>
                          {r.status}
                        </span>

                        {/* Detailed Return Status breakdown */}
                        {returnDelivery && (
                          <div className="mt-1" style={{ fontSize: '0.75rem' }}>
                            <span className="text-muted">Pickup: </span>
                            <span className="fw-semibold text-warning">
                              {returnDelivery.status}
                            </span>
                          </div>
                        )}

                        {r.status === 'ReturnCollected' && (
                          <span className="badge bg-info-subtle text-info border d-block mt-1" style={{ fontSize: '0.68rem' }}>
                            Awaiting Inspection & Check-in
                          </span>
                        )}

                        {r.stockRestored && (
                          <span className="badge bg-success-subtle text-success border border-success-subtle d-block mt-1" style={{ fontSize: '0.68rem' }}>
                            ✓ Verified & Stock Restored
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1 flex-wrap">
                          {/* Schedule Return Pickup */}
                          {['Active', 'Due', 'Overdue'].includes(r.status) && !r.returnDelivery && (
                            <button
                              onClick={() => handleSchedulePickup(r._id)}
                              className="btn btn-outline-warning btn-sm d-flex align-items-center gap-1"
                              title="Schedule Doorstep Return Pickup"
                            >
                              <RotateCcw size={13} />
                              <span>Schedule Pickup</span>
                            </button>
                          )}

                          {/* Confirm Physical Return */}
                          {['ReturnCollected', 'ReturnScheduled', 'Active', 'Overdue'].includes(r.status) && !r.stockRestored && (
                            <button
                              onClick={() => handleConfirmReturn(r._id, r.bookSnapshot.title)}
                              className="btn btn-success btn-sm d-flex align-items-center gap-1"
                              title="Confirm physical book returned to warehouse & restore stock"
                            >
                              <CheckCircle2 size={13} />
                              <span>Confirm Return</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageRentals;
