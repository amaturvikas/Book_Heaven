import React, { useState, useEffect } from 'react';
import { Truck, Save, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const DeliveryBoyProfile = () => {
  const { deliveryBoy, setDeliveryBoy } = useAuth();

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [vehicleType, setVehicleType] = useState('Bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (deliveryBoy) {
      setPhone(deliveryBoy.phone || '');
      setAddress(deliveryBoy.address || '');
      setVehicleType(deliveryBoy.vehicleDetails?.vehicleType || 'Bike');
      setVehicleNumber(deliveryBoy.vehicleDetails?.vehicleNumber || '');
    }
  }, [deliveryBoy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setFeedback(null);
      const res = await api.put('/delivery-boy/profile', {
        phone,
        address,
        vehicleDetails: {
          vehicleType,
          vehicleNumber
        }
      });
      if (res.data.success) {
        setDeliveryBoy(res.data.deliveryBoy);
        setFeedback({ type: 'success', text: 'Profile and vehicle details updated!' });
      }
    } catch (err) {
      setFeedback({ type: 'danger', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="surface-card p-4 p-sm-5">
            <div className="text-center mb-4">
              <div className="p-3 bg-info text-white rounded-3 d-inline-flex align-items-center justify-content-center mb-2 shadow-sm">
                <Truck size={28} />
              </div>
              <h3 className="fw-bold text-dark brand-font">Delivery Agent Profile</h3>
              <p className="text-muted small">Update your vehicle and contact details</p>
            </div>

            {feedback && (
              <div className={`alert alert-${feedback.type} py-2 mb-3 small`}>
                {feedback.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Employee ID</label>
                  <input
                    type="text"
                    className="form-control bg-light font-monospace fw-bold"
                    value={deliveryBoy?.employeeId || ''}
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Account Status</label>
                  <input
                    type="text"
                    className="form-control bg-light fw-bold text-success"
                    value={deliveryBoy?.status || 'Active'}
                    disabled
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Full Name</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={deliveryBoy?.name || ''}
                  disabled
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Work Email</label>
                <input
                  type="email"
                  className="form-control bg-light"
                  value={deliveryBoy?.email || ''}
                  disabled
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Contact Mobile Number *</label>
                <input
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Vehicle Type</label>
                  <select
                    className="form-select"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
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
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Base Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="d-grid">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary-custom py-2 d-flex align-items-center justify-content-center gap-2"
                >
                  <Save size={16} />
                  <span>{loading ? 'Saving...' : 'Update Vehicle & Contact'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoyProfile;
