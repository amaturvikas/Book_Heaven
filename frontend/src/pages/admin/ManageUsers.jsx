import React, { useState, useEffect } from 'react';
import { Users, Search } from 'lucide-react';
import api from '../../services/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/users');
        if (res.data.success) {
          setUsers(res.data.users);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search))
  );

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold text-dark brand-font mb-0">Customer Accounts</h2>
        <span className="text-muted small">Registered customers, contact details, and account status</span>
      </div>

      <div className="surface-card p-3 mb-4">
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-white">
            <Search size={16} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search customers by name, email, or phone number..."
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
                <th>Customer Name</th>
                <th>Email Address</th>
                <th>Contact Phone</th>
                <th>Default City</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody className="small">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">Loading customer accounts...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">No customers found.</td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <strong className="text-dark">{u.name}</strong>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone || <em className="text-muted">Not provided</em>}</td>
                    <td>
                      {u.addresses && u.addresses[0] ? (
                        <span>{u.addresses[0].city}, {u.addresses[0].state}</span>
                      ) : (
                        <em className="text-muted">No address</em>
                      )}
                    </td>
                    <td className="text-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
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

export default ManageUsers;
