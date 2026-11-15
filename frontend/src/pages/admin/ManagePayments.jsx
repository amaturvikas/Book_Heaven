import React, { useState, useEffect } from 'react';
import { CreditCard, Search } from 'lucide-react';
import api from '../../services/api';

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/payments/admin/all');
        if (res.data.success) {
          setPayments(res.data.payments);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filtered = payments.filter(
    (p) =>
      p.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      (p.user && p.user.name.toLowerCase().includes(search.toLowerCase())) ||
      (p.user && p.user.email.toLowerCase().includes(search.toLowerCase())) ||
      p.method.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold text-dark brand-font mb-0">Payment Transactions Audit</h2>
        <span className="text-muted small">Comprehensive log of COD collections and Razorpay online payments</span>
      </div>

      <div className="surface-card p-3 mb-4">
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-white">
            <Search size={16} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search payments by transaction ID, customer name, email, or method..."
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
                <th>Transaction ID</th>
                <th>Customer</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Gateway Reference</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody className="small">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">Loading payment audit logs...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No payment records found.</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <strong className="text-dark font-monospace">{p.transactionId}</strong>
                    </td>
                    <td>
                      {p.user ? (
                        <div>
                          <strong className="text-dark d-block">{p.user.name}</strong>
                          <span className="text-muted">{p.user.email}</span>
                        </div>
                      ) : (
                        <em className="text-muted">Direct / Guest Payment</em>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${p.method === 'Razorpay' ? 'bg-primary' : 'bg-secondary'}`}>
                        {p.method}
                      </span>
                    </td>
                    <td className="fw-bold text-success fs-6">
                      ₹{p.amount.toFixed(2)}
                    </td>
                    <td>
                      {p.razorpayPaymentId ? (
                        <code className="text-dark">{p.razorpayPaymentId}</code>
                      ) : (
                        <span className="text-muted">Doorstep COD</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'Completed' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-muted">
                      {new Date(p.createdAt).toLocaleString()}
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

export default ManagePayments;
