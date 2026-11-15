import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, Shield, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { customerLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get('redirect') || '/';
  const sessionExpired = queryParams.get('msg') === 'session_expired';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await customerLogin(email, password);
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
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
              <div className="p-3 bg-success text-white rounded-3 d-inline-flex align-items-center justify-content-center mb-2 shadow-sm">
                <BookOpen size={28} />
              </div>
              <h3 className="fw-bold text-dark brand-font">Customer Login</h3>
              <p className="text-muted small">Sign in to your Book Heaven account</p>
            </div>

            {sessionExpired && (
              <div className="alert alert-warning py-2 small mb-3">
                Your session has expired due to a recent password change. Please log in again.
              </div>
            )}

            {error && (
              <div className="alert alert-danger py-2 small mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold text-secondary mb-0">Password</label>
                  <Link to="/forgot-password" className="small text-success text-decoration-none">
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
                    <span>Log In</span>
                  )}
                </button>
              </div>
            </form>

            <div className="text-center mt-4 pt-3 border-top small text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-success fw-bold text-decoration-none">
                Register here
              </Link>
            </div>

            {/* Portal Switcher Links */}
            <div className="mt-4 pt-3 border-top text-center small">
              <span className="text-muted d-block mb-2">Staff Portal Access:</span>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/admin/login" className="text-secondary text-decoration-none d-flex align-items-center gap-1">
                  <Shield size={14} className="text-warning" /> Administrator
                </Link>
                <span>•</span>
                <Link to="/delivery-boy/login" className="text-secondary text-decoration-none d-flex align-items-center gap-1">
                  <Truck size={14} className="text-info" /> Delivery Agent
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
