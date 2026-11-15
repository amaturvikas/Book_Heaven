import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { customerRegister } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await customerRegister({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        }
      });
      // NEW CODE — redirect to login after registration
navigate('/login', {
  replace: true,
  state: {
    message: 'Registration successful! Please log in.'
  }
});
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="surface-card p-4 p-sm-5">
            <div className="text-center mb-4">
              <div className="p-3 bg-success text-white rounded-3 d-inline-flex align-items-center justify-content-center mb-2 shadow-sm">
                <BookOpen size={28} />
              </div>
              <h3 className="fw-bold text-dark brand-font">Create Account</h3>
              <p className="text-muted small">Join Book Heaven to buy and rent books</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Mobile Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Password *</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <hr className="my-2" />
                  <span className="small text-muted fw-bold d-block mb-2">Default Delivery Address (Optional)</span>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Street / Flat / House No.</label>
                  <input
                    type="text"
                    name="street"
                    className="form-control"
                    placeholder="42 Main Road, Green Park"
                    value={formData.street}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    placeholder="New Delhi"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">State</label>
                  <input
                    type="text"
                    name="state"
                    className="form-control"
                    placeholder="Delhi"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">PIN Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    className="form-control"
                    placeholder="110001"
                    value={formData.zipCode}
                    onChange={handleChange}
                  />
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
                    <span>Create Customer Account</span>
                  )}
                </button>
              </div>
            </form>

            <div className="text-center mt-4 pt-3 border-top small text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-success fw-bold text-decoration-none">
                Log in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
