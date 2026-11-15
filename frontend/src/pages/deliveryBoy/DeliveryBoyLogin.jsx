import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DeliveryBoyLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { deliveryBoyLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await deliveryBoyLogin(email, password);
      navigate('/delivery-boy/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid delivery personnel credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-md-4">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="surface-card p-4 p-sm-5 border-top border-4 border-info">
            <div className="text-center mb-4">
              <div className="p-3 bg-info text-white rounded-3 d-inline-flex align-items-center justify-content-center mb-2 shadow-sm">
                <Truck size={28} />
              </div>
              <h3 className="fw-bold text-dark brand-font">Delivery Agent Portal</h3>
              <p className="text-muted small">Sign in to view your assigned dispatch tasks</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Work Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="rajesh@bookheaven.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold text-secondary mb-0">Password</label>
                  <Link to="/forgot-password" className="small text-info text-decoration-none">
                    Forgot Password?
                  </Link>
                </div>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
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
                    <>
                      <Lock size={16} />
                      <span>Log In to Delivery Dashboard</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="text-center mt-4 pt-3 border-top small text-muted">
              Demo Credentials: <code>rajesh@bookheaven.com</code> / <code>Delivery@123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoyLogin;
