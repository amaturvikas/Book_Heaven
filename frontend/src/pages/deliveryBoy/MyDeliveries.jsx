import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, MapPin, Phone, ArrowRight, Package, Search } from 'lucide-react';
import api from '../../services/api';

const MyDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/deliveries/delivery-boy/active');
      if (res.data.success) {
        setDeliveries(res.data.deliveries);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const filtered = deliveries.filter((d) => {
    const matchesStatus = !statusFilter || d.status === statusFilter;
    const matchesSearch =
      d.deliveryNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.customerName.toLowerCase().includes(search.toLowerCase()) ||
      d.deliveryAddress.city.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark brand-font mb-0">My Assigned Delivery Tasks</h2>
          <span className="text-muted small">Update status, acknowledge pickups, and record deliveries</span>
        </div>
        <Link to="/delivery-boy/history" className="btn btn-outline-custom btn-sm">
          Completed History &rarr;
        </Link>
      </div>

      {/* Filter and Search Bar */}
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
                placeholder="Search tasks by delivery #, customer, or city..."
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
              <option value="">All Active Statuses</option>
              <option value="Assigned">Assigned (Pending Pickup)</option>
              <option value="PickedUp">Picked Up</option>
              <option value="OutForDelivery">Out for Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deliveries List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status"></div>
          <div className="text-muted small mt-2">Loading tasks...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 surface-card">
          <Package size={48} className="text-muted mb-2" />
          <h5 className="text-dark">No matching delivery tasks</h5>
          <p className="text-muted small">Check back soon or notify your administrator.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map((del) => (
            <div key={del._id} className="surface-card p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-2 border-bottom mb-3">
                <div>
                  <span className="badge bg-light text-dark border me-2">{del.type}</span>
                  <strong className="text-dark">#{del.deliveryNumber}</strong>
                </div>
                <span className={`badge status-badge-${del.status} px-3 py-1 font-weight-bold`}>
                  {del.status}
                </span>
              </div>

              <div className="row g-3 align-items-center">
                <div className="col-md-7">
                  <h6 className="fw-bold text-dark mb-1">{del.customerName}</h6>
                  <div className="small text-secondary mb-2 d-flex align-items-center gap-1">
                    <MapPin size={14} className="text-danger flex-shrink-0" />
                    <span>{del.deliveryAddress.street}, {del.deliveryAddress.city} - {del.deliveryAddress.zipCode}</span>
                  </div>
                  <div className="small text-muted d-flex align-items-center gap-1">
                    <Phone size={14} className="text-success flex-shrink-0" />
                    <a href={`tel:${del.customerPhone}`} className="text-success fw-bold text-decoration-none">
                      {del.customerPhone} (Click to Call)
                    </a>
                  </div>
                </div>

                <div className="col-md-5 text-md-end">
                  <div className="small text-muted mb-2">
                    {del.items && del.items.map((i) => `${i.title} (x${i.quantity})`).join(', ')}
                  </div>
                  <Link
                    to={`/delivery-boy/deliveries/${del._id}`}
                    className="btn btn-primary-custom btn-sm d-inline-flex align-items-center gap-1"
                  >
                    <span>Update Task Status</span>
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

export default MyDeliveries;
