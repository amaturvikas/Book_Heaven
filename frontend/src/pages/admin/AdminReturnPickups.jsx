import React, { useState, useEffect } from 'react';
import { RotateCcw, Truck, CheckCircle2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AdminReturnPickups = () => {
  const [returnPickups, setReturnPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/deliveries/admin/all?type=RentalReturnPickup');
      if (res.data.success) {
        setReturnPickups(res.data.deliveries);
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

  const filtered = returnPickups.filter(
    (p) =>
      p.deliveryNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (p.assignedDeliveryBoy && p.assignedDeliveryBoy.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark brand-font mb-0">Rental Return Pickups Queue</h2>
          <span className="text-muted small">Doorstep collections scheduled for rented books</span>
        </div>
        <Link to="/admin/deliveries" className="btn btn-outline-custom btn-sm">
          &larr; All Deliveries
        </Link>
      </div>

      <div className="surface-card p-3 mb-4">
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-white">
            <Search size={16} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search return pickups by #, customer, or agent..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="surface-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="small text-muted">
                <th>Return Delivery #</th>
                <th>Customer & Collection Address</th>
                <th>Book Item</th>
                <th>Assigned Agent</th>
                <th>Collection Status</th>
                <th className="text-end">Audit</th>
              </tr>
            </thead>
            <tbody className="small">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">Loading return pickups...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">No return pickups currently scheduled.</td>
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
                      <strong className="text-dark d-block">{del.customerName}</strong>
                      <span className="text-muted">{del.pickupLocation}</span>
                    </td>
                    <td>
                      {del.items && del.items[0] ? (
                        <span>{del.items[0].title} (x{del.items[0].quantity})</span>
                      ) : (
                        'Rented Book'
                      )}
                    </td>
                    <td>
                      {del.assignedDeliveryBoy ? (
                        <div>
                          <strong className="text-dark d-block">{del.assignedDeliveryBoy.name}</strong>
                          <span className="text-muted small">{del.assignedDeliveryBoy.phone}</span>
                        </div>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning border">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge status-badge-${del.status} px-2 py-1`}>
                        {del.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <Link to={`/admin/deliveries/${del._id}`} className="btn btn-outline-secondary btn-sm">
                        View Audit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReturnPickups;
