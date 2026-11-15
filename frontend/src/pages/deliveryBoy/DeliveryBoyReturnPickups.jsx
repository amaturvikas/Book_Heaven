import React, { useState, useEffect } from 'react';
import { RotateCcw, MapPin, Phone, CheckCircle2, ArrowRight, Truck, Package, Clock, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const DeliveryBoyReturnPickups = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/deliveries/delivery-boy/return-pickups');
      if (res.data.success) {
        setPickups(res.data.returnPickups);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const getReturnStatusBadge = (status) => {
    switch (status) {
      case 'Assigned':
        return <span className="badge bg-warning-subtle text-dark border px-3 py-1">Assigned (Ready for Pickup)</span>;
      case 'PickedUp':
        return <span className="badge bg-info-subtle text-info border px-3 py-1">Collected from Customer</span>;
      case 'OutForDelivery':
        return <span className="badge bg-primary-subtle text-primary border px-3 py-1">In Transit to Warehouse</span>;
      case 'Delivered':
        return <span className="badge bg-success-subtle text-success border px-3 py-1">Deposited at Warehouse (Return Collected)</span>;
      case 'Failed':
        return <span className="badge bg-danger-subtle text-danger border px-3 py-1">Pickup Failed</span>;
      default:
        return <span className="badge bg-secondary px-3 py-1">{status}</span>;
    }
  };

  const filteredPickups = pickups.filter((p) => {
    if (filter === 'active') return ['Assigned', 'PickedUp', 'OutForDelivery'].includes(p.status);
    if (filter === 'completed') return p.status === 'Delivered';
    return true;
  });

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark brand-font mb-0">Assigned Rental Return Pickups</h2>
          <span className="text-muted small">Collect returned books from customers and return them to the warehouse</span>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary-custom' : 'btn-outline-custom'}`}
          >
            All Pickups ({pickups.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`btn btn-sm ${filter === 'active' ? 'btn-primary-custom' : 'btn-outline-custom'}`}
          >
            Active Tasks
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`btn btn-sm ${filter === 'completed' ? 'btn-primary-custom' : 'btn-outline-custom'}`}
          >
            Completed Returns
          </button>
        </div>
      </div>

      <div className="alert alert-info py-2 px-3 small border-0 shadow-sm mb-4 d-flex align-items-center gap-2">
        <RotateCcw size={18} className="flex-shrink-0" />
        <div>
          <strong>Return Collection Workflow:</strong> Collect the rental book from the customer's pickup address, advance the status to <em>Collected</em> & <em>In Transit</em>, and deposit it at the Book Heaven Central Warehouse. Once deposited, the Administrator inspects the book to verify condition and restore inventory.
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status"></div>
          <div className="text-muted small mt-2">Loading return pickup tasks...</div>
        </div>
      ) : filteredPickups.length === 0 ? (
        <div className="text-center py-5 surface-card">
          <RotateCcw size={48} className="text-muted mb-2" />
          <h5 className="text-dark">No rental return pickups found</h5>
          <p className="text-muted small">You currently have no return pickups in this category.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredPickups.map((del) => (
            <div key={del._id} className="surface-card p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-2 border-bottom mb-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-warning text-dark fw-bold">Return Pickup</span>
                  <strong className="text-dark fs-6">#{del.deliveryNumber}</strong>
                  {del.rental && del.rental.rentalNumber && (
                    <span className="text-muted small">
                      (Rental #{del.rental.rentalNumber})
                    </span>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="small text-muted">Return Status:</span>
                  {getReturnStatusBadge(del.status)}
                </div>
              </div>

              <div className="row g-3 align-items-center">
                <div className="col-md-7">
                  <h6 className="fw-bold text-dark mb-1">{del.customerName}</h6>
                  <div className="small text-secondary mb-2 d-flex align-items-center gap-1">
                    <MapPin size={14} className="text-danger flex-shrink-0" />
                    <span><strong>Customer Pickup Address:</strong> {del.pickupLocation}</span>
                  </div>
                  <div className="small text-secondary mb-2 d-flex align-items-center gap-1">
                    <Package size={14} className="text-primary flex-shrink-0" />
                    <span><strong>Destination:</strong> {del.deliveryAddress?.street || 'Book Heaven Central Warehouse'}, {del.deliveryAddress?.city || 'New Delhi'}</span>
                  </div>
                  <div className="small text-muted d-flex align-items-center gap-1">
                    <Phone size={14} className="text-success flex-shrink-0" />
                    <a href={`tel:${del.customerPhone}`} className="text-success fw-bold text-decoration-none">
                      {del.customerPhone} (Click to Call Customer)
                    </a>
                  </div>
                </div>

                <div className="col-md-5 text-md-end">
                  <div className="small text-muted mb-2">
                    <strong>Book to Collect:</strong>{' '}
                    {del.items && del.items.map((i) => `${i.title} (Qty: ${i.quantity})`).join(', ')}
                  </div>
                  <Link
                    to={`/delivery-boy/deliveries/${del._id}`}
                    className="btn btn-primary-custom btn-sm d-inline-flex align-items-center gap-1"
                  >
                    <span>Manage Return Status</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryBoyReturnPickups;
