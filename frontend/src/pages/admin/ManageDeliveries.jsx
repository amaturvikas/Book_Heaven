import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, UserCheck, Search, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const ManageDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [activeDeliveryBoys, setActiveDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Assign Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const res = await api.get('/deliveries/admin/all', { params });
      if (res.data.success) {
        setDeliveries(res.data.deliveries);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await api.get('/admin/delivery-boys');
      if (res.data.success) {
        // Filter only Active delivery boys as required by Section 4
        setActiveDeliveryBoys(res.data.deliveryBoys.filter((db) => db.status === 'Active'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    fetchAgents();
  }, [statusFilter, typeFilter]);

  const openAssignModal = (del) => {
    setSelectedDelivery(del);
    setSelectedAgentId(del.assignedDeliveryBoy?._id || '');
    setAssignNotes('');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAgentId) {
      setFeedback({ type: 'danger', text: 'Please select an active delivery boy.' });
      return;
    }

    try {
      setAssigning(true);
      await api.post(`/deliveries/admin/${selectedDelivery._id}/assign`, {
        deliveryBoyId: selectedAgentId,
        notes: assignNotes
      });
      setFeedback({ type: 'success', text: 'Delivery assigned successfully!' });
      setShowAssignModal(false);
      fetchDeliveries();
    } catch (err) {
      setFeedback({ type: 'danger', text: err.response?.data?.message || 'Assignment failed.' });
    } finally {
      setAssigning(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const filtered = deliveries.filter(
    (d) =>
      d.deliveryNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (d.assignedDeliveryBoy && d.assignedDeliveryBoy.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark brand-font mb-0">Delivery Task Operations</h2>
          <span className="text-muted small">Dispatch, assign active delivery boys, and monitor fulfillment</span>
        </div>
        <Link to="/admin/return-pickups" className="btn btn-outline-custom btn-sm">
          Return Pickups Queue &rarr;
        </Link>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} py-2 mb-3 small`}>
          {feedback.text}
        </div>
      )}

      {/* Filters & Search Row */}
      <div className="surface-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by delivery #, customer, or agent..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PendingAssignment">Pending Assignment</option>
              <option value="Assigned">Assigned</option>
              <option value="PickedUp">Picked Up</option>
              <option value="OutForDelivery">Out For Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div className="col-md-4">
            <select
              className="form-select form-select-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Delivery Types</option>
              <option value="Purchase">Purchase Delivery</option>
              <option value="RentalDelivery">Rental Outbound Delivery</option>
              <option value="RentalReturnPickup">Rental Return Pickup</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="surface-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="small text-muted">
                <th>Delivery #</th>
                <th>Type</th>
                <th>Customer & Address</th>
                <th>Assigned Agent</th>
                <th>Status</th>
                <th>Timeline Stage</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="small">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">Loading delivery tasks...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No delivery tasks found matching criteria.</td>
                </tr>
              ) : (
                filtered.map((del) => (
                  <tr key={del._id}>
                    <td>
                      <strong className="text-dark d-block">#{del.deliveryNumber}</strong>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {new Date(del.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{del.type}</span>
                    </td>
                    <td>
                      <strong className="d-block text-dark">{del.customerName}</strong>
                      <span className="text-muted text-truncate d-block" style={{ maxWidth: '220px' }}>
                        {del.deliveryAddress.street}, {del.deliveryAddress.city}
                      </span>
                    </td>
                    <td>
                      {del.assignedDeliveryBoy ? (
                        <div>
                          <strong className="text-dark d-block">{del.assignedDeliveryBoy.name}</strong>
                          <span className="text-muted small">{del.assignedDeliveryBoy.phone}</span>
                        </div>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning border border-warning-subtle">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge status-badge-${del.status} px-2 py-1`}>
                        {del.status}
                      </span>
                      {del.status === 'Failed' && (
                        <div className="text-danger small mt-1" style={{ fontSize: '0.72rem' }}>
                          Reason: {del.failureReason}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="small text-muted">
                        {del.timeline ? `${del.timeline.length} recorded events` : '0 events'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        {/* Assign / Reassign Button */}
                        {del.status !== 'Delivered' && (
                          <button
                            onClick={() => openAssignModal(del)}
                            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                          >
                            <UserCheck size={14} />
                            <span>{del.assignedDeliveryBoy ? 'Reassign' : 'Assign'}</span>
                          </button>
                        )}
                        <Link
                          to={`/admin/deliveries/${del._id}`}
                          className="btn btn-outline-secondary btn-sm"
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedDelivery && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  {selectedDelivery.assignedDeliveryBoy ? 'Reassign Delivery Agent' : 'Assign Delivery Agent'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)}></button>
              </div>

              <form onSubmit={handleAssignSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <span className="text-muted small d-block">Task Details:</span>
                    <strong>#{selectedDelivery.deliveryNumber}</strong> ({selectedDelivery.type})
                    <div className="small text-secondary mt-1">
                      Customer: {selectedDelivery.customerName} ({selectedDelivery.deliveryAddress.city})
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Select Active Delivery Boy *
                    </label>
                    <select
                      className="form-select"
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Active Delivery Boy --</option>
                      {activeDeliveryBoys.map((db) => (
                        <option key={db._id} value={db._id}>
                          {db.name} ({db.employeeId}) — {db.vehicleDetails?.vehicleType || 'Bike'} (Active tasks: {db.activeTasks || 0})
                        </option>
                      ))}
                    </select>
                    <div className="form-text small">
                      Only Active delivery boys are eligible for new task assignments.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Special Dispatch Notes</label>
                    <textarea
                      rows="2"
                      className="form-control"
                      placeholder="e.g. Call customer 10 mins before arrival..."
                      value={assignNotes}
                      onChange={(e) => setAssignNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowAssignModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={assigning || !selectedAgentId} className="btn btn-primary-custom btn-sm">
                    {assigning ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDeliveries;
