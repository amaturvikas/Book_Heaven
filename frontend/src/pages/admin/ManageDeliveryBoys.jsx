import React, { useState, useEffect } from 'react';
import { Truck, Plus, CheckCircle, XCircle, Search, Edit } from 'lucide-react';
import api from '../../services/api';

const ManageDeliveryBoys = () => {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    password: '',
    address: '',
    vehicleType: 'Bike',
    vehicleNumber: ''
  });

  const fetchDeliveryBoys = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/delivery-boys');
      if (res.data.success) {
        setDeliveryBoys(res.data.deliveryBoys);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      employeeId: `DB-${Math.floor(100 + Math.random() * 900)}`,
      password: 'Delivery@123',
      address: '',
      vehicleType: 'Bike',
      vehicleNumber: ''
    });
    setShowModal(true);
  };

  const openEditModal = (db) => {
    setIsEditing(true);
    setEditId(db._id);
    setFormData({
      name: db.name,
      email: db.email,
      phone: db.phone,
      employeeId: db.employeeId,
      password: '',
      address: db.address || '',
      vehicleType: db.vehicleDetails?.vehicleType || 'Bike',
      vehicleNumber: db.vehicleDetails?.vehicleNumber || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (isEditing) {
        await api.patch(`/admin/delivery-boys/${editId}`, {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          vehicleDetails: {
            vehicleType: formData.vehicleType,
            vehicleNumber: formData.vehicleNumber
          }
        });
        setFeedback({ type: 'success', text: 'Delivery agent updated successfully!' });
      } else {
        await api.post('/admin/delivery-boys', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          employeeId: formData.employeeId,
          password: formData.password,
          address: formData.address,
          vehicleDetails: {
            vehicleType: formData.vehicleType,
            vehicleNumber: formData.vehicleNumber
          }
        });
        setFeedback({ type: 'success', text: 'Delivery agent account created successfully!' });
      }

      setShowModal(false);
      fetchDeliveryBoys();
    } catch (err) {
      setFeedback({ type: 'danger', text: err.response?.data?.message || 'Action failed.' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleToggleStatus = async (id, currentStatus, name) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(`/admin/delivery-boys/${id}/status`, { status: newStatus });
      setFeedback({ type: 'success', text: `${name} is now ${newStatus}.` });
      fetchDeliveryBoys();
    } catch (err) {
      setFeedback({ type: 'danger', text: err.response?.data?.message || 'Status update failed.' });
    } finally {
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const filtered = deliveryBoys.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search)
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark brand-font mb-0">Delivery Personnel Management</h2>
          <span className="text-muted small">Manage delivery fleet, activate/deactivate agents, and check workloads</span>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary-custom d-flex align-items-center gap-1">
          <Plus size={16} />
          <span>New Delivery Agent</span>
        </button>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} py-2 mb-3 small`}>
          {feedback.text}
        </div>
      )}

      {/* Search Bar */}
      <div className="surface-card p-3 mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <Search size={18} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Search agents by name, ID, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Agents Table */}
      <div className="surface-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="small text-muted">
                <th>Emp ID</th>
                <th>Name & Contact</th>
                <th>Vehicle</th>
                <th>Active Tasks</th>
                <th>Completed Tasks</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="small">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">Loading fleet data...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No delivery personnel found.</td>
                </tr>
              ) : (
                filtered.map((db) => (
                  <tr key={db._id}>
                    <td>
                      <span className="badge bg-light text-dark border font-monospace">
                        {db.employeeId}
                      </span>
                    </td>
                    <td>
                      <strong className="text-dark d-block">{db.name}</strong>
                      <span className="text-muted">{db.phone} • {db.email}</span>
                    </td>
                    <td>
                      <span className="d-block">{db.vehicleDetails?.vehicleType || 'Bike'}</span>
                      <small className="text-muted">{db.vehicleDetails?.vehicleNumber || 'No plate'}</small>
                    </td>
                    <td>
                      <span className={`badge ${db.activeTasks > 0 ? 'bg-primary' : 'bg-light text-muted border'}`}>
                        {db.activeTasks || 0} active
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success">
                        {db.completedTasks || 0} delivered
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${db.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                        {db.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          onClick={() => openEditModal(db)}
                          className="btn btn-outline-secondary"
                          title="Edit Details"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(db._id, db.status, db.name)}
                          className={`btn ${db.status === 'Active' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          title={db.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {db.status === 'Active' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  {isEditing ? 'Edit Delivery Personnel' : 'Register New Delivery Personnel'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  {!isEditing && (
                    <div className="row g-2 mb-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Employee ID *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.employeeId}
                          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Initial Password *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={isEditing}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Mobile Number *</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Vehicle Type</label>
                      <select
                        className="form-select"
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      >
                        <option value="Bike">Motorcycle / Bike</option>
                        <option value="Scooter">Scooter</option>
                        <option value="Electric Scooter">Electric Scooter</option>
                        <option value="Van">Van</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Vehicle Number Plate</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. DL-01-AB-1234"
                        value={formData.vehicleNumber}
                        onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Residential Base / Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Sector 15, Rohini, New Delhi"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary-custom btn-sm">
                    {submitting ? 'Saving...' : isEditing ? 'Update Agent' : 'Create Agent Account'}
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

export default ManageDeliveryBoys;
