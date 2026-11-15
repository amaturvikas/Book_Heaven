import React, { useState } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, Smartphone } from 'lucide-react';
import axios from 'axios';
import api from '../services/api';

const ResetPassword = () => {
  const { token: pathToken } = useParams();
  const [searchParams] = useSearchParams();
  const queryToken = searchParams.get('token');
  const location = useLocation();
  const navigate = useNavigate();

  // Extract token from either path parameter or query string parameter
  const rawToken = pathToken || queryToken || '';
  const token = rawToken ? decodeURIComponent(rawToken).trim() : '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Determine role based on current URL path
  const isAdmin = location.pathname.startsWith('/admin');
  const isDeliveryBoy = location.pathname.startsWith('/delivery-boy');

  const roleName = isAdmin ? 'Administrator' : isDeliveryBoy ? 'Delivery Personnel' : 'Customer';
  const loginPath = isAdmin ? '/admin/login' : isDeliveryBoy ? '/delivery-boy/login' : '/login';
  const forgotPath = '/forgot-password';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Password reset token is missing from the link. Please request a new reset email.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setLoading(true);

      let endpoint = `/auth/reset-password/${encodeURIComponent(token)}`;
      if (isAdmin) {
        endpoint = `/admin/reset-password/${encodeURIComponent(token)}`;
      } else if (isDeliveryBoy) {
        endpoint = `/delivery-boy/reset-password/${encodeURIComponent(token)}`;
      }

      if (import.meta.env.DEV) {
        console.log(`[ResetPassword] Submitting to endpoint: ${endpoint} (Role: ${roleName})`);
      }

      let response;
      try {
        response = await api.post(endpoint, {
          password,
          confirmPassword
        });
      } catch (primaryErr) {
        // If primary call failed due to network connectivity / host mismatch (e.g. mobile or localhost/127.0.0.1 variation)
        if (primaryErr.code === 'ERR_NETWORK' || !primaryErr.response) {
          const protocol = window.location.protocol;
          const hostname = window.location.hostname;
          let fallbackUrl = null;

          if (hostname === 'localhost') {
            fallbackUrl = `http://127.0.0.1:5000/api${endpoint}`;
          } else if (hostname === '127.0.0.1') {
            fallbackUrl = `http://localhost:5000/api${endpoint}`;
          } else {
            fallbackUrl = `${protocol}//${hostname}:5000/api${endpoint}`;
          }

          if (fallbackUrl) {
            response = await axios.post(
              fallbackUrl,
              { password, confirmPassword },
              { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
            );
          } else {
            throw primaryErr;
          }
        } else {
          throw primaryErr;
        }
      }

      setSuccess(true);
      setMessage(
        response.data?.message || 'Password reset successful. You can now log in.'
      );
      setPassword('');
      setConfirmPassword('');

      // Redirect smoothly after user reads confirmation
      setTimeout(() => {
        navigate(loginPath);
      }, 2500);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[ResetPassword] Error:', err.message, err.response?.status, err.response?.data);
      }

      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError(
          'Cannot connect to the Book Heaven server. If you opened this link on a mobile phone, verify that your phone is connected to the same Wi-Fi network as the laptop, or verify server deployment.'
        );
      } else if (err.response?.status === 400) {
        setError(
          err.response.data?.message ||
          'This password reset link is invalid, expired, or has already been used. Please request a new link.'
        );
      } else if (err.response?.status === 429) {
        setError('Too many attempts. Please wait a few moments before trying again.');
      } else {
        setError(
          err.response?.data?.message ||
          'Password reset failed. Please request a new reset link.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4 py-md-5 my-md-3">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-5">
          <div className="surface-card p-3 p-sm-4 p-md-5 shadow-sm border rounded-4">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="p-3 bg-success-subtle text-success rounded-3 d-inline-flex align-items-center justify-content-center mb-2">
                <Lock size={28} />
              </div>
              <h3 className="fw-bold text-dark brand-font mb-1 fs-4 fs-md-3">Reset Password</h3>
              <p className="text-muted small mb-0">
                {roleName} Portal &bull; Set a secure new password for your account
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger py-2 px-3 small mb-3 d-flex align-items-start gap-2 rounded-3">
                <AlertCircle size={18} className="flex-shrink-0 mt-1 text-danger" />
                <span className="flex-grow-1" style={{ wordBreak: 'break-word' }}>{error}</span>
              </div>
            )}

            {/* Success State */}
            {success ? (
              <div className="text-center py-3">
                <CheckCircle2 size={52} className="text-success mb-3 animate__animated animate__bounceIn" />
                <h5 className="fw-bold text-dark mb-2">Password Successfully Reset!</h5>
                <p className="text-secondary small mb-4">
                  {message} Redirecting to your login portal in a moment...
                </p>
                <Link
                  to={loginPath}
                  className="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center"
                  style={{ minHeight: '48px', fontSize: '16px' }}
                >
                  Proceed to Login Now
                </Link>
              </div>
            ) : !token ? (
              /* Missing Token State */
              <div className="text-center py-3">
                <AlertCircle size={48} className="text-warning mb-3" />
                <h5 className="fw-bold text-dark mb-2">Missing Reset Token</h5>
                <p className="text-secondary small mb-4">
                  The link you clicked appears to be incomplete or missing its security token. If you opened the email in an app, try copying and opening the full link in your browser.
                </p>
                <Link
                  to={forgotPath}
                  className="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                  style={{ minHeight: '48px' }}
                >
                  <RefreshCw size={16} />
                  <span>Request New Reset Link</span>
                </Link>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit} noValidate>
                {/* New Password */}
                <div className="mb-3">
                  <label htmlFor="newPasswordInput" className="form-label small fw-semibold text-secondary mb-1">
                    New Password
                  </label>
                  <div className="input-group">
                    <input
                      id="newPasswordInput"
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Enter new password (min. 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      minLength={6}
                      required
                      disabled={loading}
                      style={{ minHeight: '48px', fontSize: '16px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary border-start-0 d-flex align-items-center px-3"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{ minHeight: '48px' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                    Must be at least 6 characters long
                  </small>
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label htmlFor="confirmPasswordInput" className="form-label small fw-semibold text-secondary mb-1">
                    Confirm New Password
                  </label>
                  <div className="input-group">
                    <input
                      id="confirmPasswordInput"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      minLength={6}
                      required
                      disabled={loading}
                      style={{ minHeight: '48px', fontSize: '16px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary border-start-0 d-flex align-items-center px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex="-1"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      style={{ minHeight: '48px' }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                  disabled={loading}
                  style={{ minHeight: '48px', fontSize: '16px' }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Set New Password</span>
                  )}
                </button>

                {/* Back to Login Link */}
                <div className="text-center mt-4 pt-2">
                  <Link
                    to={loginPath}
                    className="text-decoration-none small text-muted d-inline-flex align-items-center gap-1 py-1"
                  >
                    <ArrowLeft size={14} /> Back to {roleName} Login
                  </Link>
                </div>
              </form>
            )}
          </div>

          {/* Mobile Helper Card */}
          <div className="text-center mt-3 text-muted small px-2">
            <span className="d-inline-flex align-items-center gap-1">
              <Smartphone size={14} /> Mobile & Desktop Secure Authentication
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
