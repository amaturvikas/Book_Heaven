import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Truck, Package, MapPin, User, Calendar } from 'lucide-react';
import api from '../../services/api';
import DeliveryTimeline from '../../components/DeliveryTimeline';

const AdminDeliveryDetails = () => {
  const { id } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/deliveries/${id}`);
        if (res.data.success) {
          setDelivery(res.data.delivery);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load delivery details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDelivery();
  }, [id]);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="text-muted small mt-2">Loading delivery details...</div>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger d-inline-block px-4 py-2">
          {error || 'Delivery record not found.'}
        </div>
        <div>
          <Link to="/admin/deliveries" className="btn btn-outline-custom mt-3">
            <ArrowLeft size={16} /> Back to Deliveries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Link to="/admin/deliveries" className="btn btn-outline-custom btn-sm mb-4 d-inline-flex align-items-center gap-1">
        <ArrowLeft size={15} /> Back to Deliveries List
      </Link>

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <span className="text-muted small">DELIVERY AUDIT RECORD</span>
          <h3 className="fw-bold text-dark brand-font mb-0">#{delivery.deliveryNumber}</h3>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className={`badge status-badge-${delivery.status} px-3 py-2 rounded-pill font-weight-bold`}>
            {delivery.status}
          </span>
          <span className="badge bg-light text-dark border">
            {delivery.type}
          </span>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Timeline */}
        <div className="col-lg-7">
          <DeliveryTimeline delivery={delivery} />

          {/* Proof of delivery if completed */}
          {delivery.proofOfDelivery && delivery.proofOfDelivery.recipientName && (
            <div className="surface-card p-4 mt-4 border-success bg-success-subtle bg-opacity-10">
              <h6 className="fw-bold text-success mb-2">Proof of Delivery Confirmation</h6>
              <div className="small text-secondary">
                <p className="mb-1"><strong>Received By:</strong> {delivery.proofOfDelivery.recipientName}</p>
                {delivery.proofOfDelivery.notes && <p className="mb-1"><strong>Agent Notes:</strong> {delivery.proofOfDelivery.notes}</p>}
                {delivery.proofOfDelivery.timestamp && (
                  <p className="mb-0 text-muted"><strong>Timestamp:</strong> {new Date(delivery.proofOfDelivery.timestamp).toLocaleString()}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Customer & Task Specs */}
        <div className="col-lg-5">
          <div className="surface-card p-4 mb-4">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <MapPin size={18} className="text-danger" /> Delivery & Destination
            </h6>
            <div className="small text-secondary mb-3">
              <strong className="text-dark d-block">{delivery.customerName}</strong>
              <div>{delivery.deliveryAddress.street}</div>
              <div>{delivery.deliveryAddress.city}, {delivery.deliveryAddress.state} - {delivery.deliveryAddress.zipCode}</div>
              <div className="text-muted mt-1">Phone: {delivery.customerPhone}</div>
            </div>

            <div className="border-top pt-3">
              <span className="small text-muted d-block">Origin / Pickup Location:</span>
              <div className="small text-dark">{delivery.pickupLocation}</div>
            </div>
          </div>

          <div className="surface-card p-4">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Package size={18} className="text-success" /> Package Items
            </h6>
            <div className="d-flex flex-column gap-2 mb-3">
              {delivery.items.map((item, idx) => (
                <div key={idx} className="d-flex justify-content-between align-items-center small py-1 border-bottom">
                  <span>{item.title}</span>
                  <span className="badge bg-light text-dark border">Qty: {item.quantity}</span>
                </div>
              ))}
            </div>

            {delivery.deliveryInstructions && (
              <div className="alert alert-light border small text-muted mb-0">
                <strong>Instructions:</strong> {delivery.deliveryInstructions}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDeliveryDetails;
