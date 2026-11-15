import React, { useState, useEffect } from 'react';
import { PackageCheck, Search, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const DeliveryBoyHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/deliveries/delivery-boy/history');
        if (res.data.success) {
          setHistory(res.data.deliveries);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = history.filter(
    (d) =>
      d.deliveryNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.customerName.toLowerCase().includes(search.toLowerCase()) ||
      d.deliveryAddress.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold text-dark brand-font mb-0">Delivery History</h2>
        <span className="text-muted small">Completed and recorded delivery tasks</span>
      </div>

      <div className="surface-card p-3 mb-4">
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-white">
            <Search size={16} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search completed tasks by delivery #, customer, or city..."
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
                <th>Delivery #</th>
                <th>Type</th>
                <th>Customer</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Completed / Logged At</th>
                <th className="text-end">View</th>
              </tr>
            </thead>
            <tbody className="small">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">Loading history...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No completed delivery history records.</td>
                </tr>
              ) : (
                filtered.map((del) => (
                  <tr key={del._id}>
                    <td>
                      <strong className="text-dark d-block">#{del.deliveryNumber}</strong>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{del.type}</span>
                    </td>
                    <td>{del.customerName}</td>
                    <td>{del.deliveryAddress.city}</td>
                    <td>
                      <span className={`badge status-badge-${del.status} px-2 py-1`}>
                        {del.status}
                      </span>
                      {del.failureReason && (
                        <div className="text-danger small mt-1" style={{ fontSize: '0.72rem' }}>
                          {del.failureReason}
                        </div>
                      )}
                    </td>
                    <td className="text-muted">
                      {del.deliveredTimestamp
                        ? new Date(del.deliveredTimestamp).toLocaleString()
                        : del.failedTimestamp
                        ? new Date(del.failedTimestamp).toLocaleString()
                        : new Date(del.updatedAt).toLocaleString()}
                    </td>
                    <td className="text-end">
                      <Link to={`/delivery-boy/deliveries/${del._id}`} className="btn btn-outline-secondary btn-sm">
                        View
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

export default DeliveryBoyHistory;
