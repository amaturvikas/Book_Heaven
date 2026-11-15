import React, { useState } from 'react';
import { Search, Truck, AlertCircle } from 'lucide-react';
import api from '../services/api';
import DeliveryTimeline from '../components/DeliveryTimeline';

const DeliveryTracking = () => {
  const [deliveryId, setDeliveryId] = useState('');
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!deliveryId.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setDelivery(null);

      const res = await api.get(`/deliveries/${deliveryId.trim()}`);
      if (res.data.success) {
        setDelivery(res.data.delivery);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Delivery record not found with that ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="text-center mb-4">
            <div className="p-3 bg-primary-subtle text-primary rounded-3 d-inline-flex align-items-center justify-content-center mb-2">
              <Truck size={32} />
            </div>
            <h2 className="fw-bold text-dark brand-font">Delivery Tracking</h2>
            <p className="text-muted small">
              Track the live dispatch and field transit status of your book package or return pickup.
            </p>
          </div>

          {/* Search Box */}
          <div className="surface-card p-4 mb-4">
            <form onSubmit={handleTrack}>
              <label className="form-label small fw-semibold text-secondary">Delivery Reference ID</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Delivery Mongo ID (e.g. 660f...)"
                  value={deliveryId}
                  onChange={(e) => setDeliveryId(e.target.value)}
                  required
                />
                <button type="submit" disabled={loading} className="btn btn-primary-custom d-flex align-items-center gap-1">
                  <Search size={16} />
                  <span>{loading ? 'Locating...' : 'Track Package'}</span>
                </button>
              </div>
            </form>
          </div>

          {error && (
            <div className="alert alert-danger py-3 small d-flex align-items-center gap-2 mb-4">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {delivery && (
            <DeliveryTimeline delivery={delivery} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracking;
