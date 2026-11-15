import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('customer'); // customer, admin, deliveryBoy
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your registered email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let endpoint = '/auth/forgot-password';
      if (role === 'admin') endpoint = '/admin/forgot-password';
      if (role === 'deliveryBoy') endpoint = '/delivery-boy/forgot-password';

      const clientUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
      await api.post(endpoint, { email, clientUrl });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-md-4">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="surface-card p-4 p-sm-5">
            <div className="text-center mb-4">
              <div className="p-3 bg-success-subtle text-success rounded-3 d-inline-flex align-items-center justify-content-center mb-2">
                <KeyRound size={28} />
              </div>
              <h3 className="fw-bold text-dark brand-font">Forgot Password</h3>
              <p className="text-muted small">
                Enter your registered email to receive a secure password reset link (valid for 15 minutes).
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-3">
                <CheckCircle2 size={48} className="text-success mb-3" />
                <h5 className="fw-bold text-dark mb-2">Check Your Email</h5>
                <p className="text-secondary small mb-4">
                  If an eligible account exists for <strong>{email}</strong>, a password reset link has been dispatched.
                </p>
                <div className="alert alert-light border small text-muted text-start mb-4">
                  <strong>Development Note:</strong> If testing locally without SMTP configured, inspect the backend terminal console where the secure reset link is printed for direct testing!
                </div>
                <Link to="/login" className="btn btn-outline-custom w-100">
                  Return to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger py-2 small mb-3 d-flex align-items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Account Role</label>
                  <select
                    className="form-select form-select-sm"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="customer">Customer Account</option>
                    <option value="deliveryBoy">Delivery Boy Account</option>
                    <option value="admin">Administrator Account</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Registered Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="d-grid mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary-custom py-2 d-flex align-items-center justify-content-center gap-2"
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </div>

                <div className="text-center mt-4 pt-3 border-top">
                  <Link to="/login" className="small text-secondary text-decoration-none d-inline-flex align-items-center gap-1">
                    <ArrowLeft size={14} /> Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
