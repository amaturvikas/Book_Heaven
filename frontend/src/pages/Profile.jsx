import React, { useState, useEffect } from 'react';
import { User, Lock, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, setUser } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Delhi');
  const [zipCode, setZipCode] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Change Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      const addr = user.addresses?.[0] || {};
      setStreet(addr.street || '');
      setCity(addr.city || '');
      setState(addr.state || 'Delhi');
      setZipCode(addr.zipCode || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileMsg(null);
      const res = await api.put('/auth/profile', {
        name,
        phone,
        addresses: [{
          street,
          city,
          state,
          zipCode,
          isDefault: true
        }]
      });
      if (res.data.success) {
        setUser(res.data.user);
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setProfileMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
      setTimeout(() => setProfileMsg(null), 3500);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'danger', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'danger', text: 'New password must be at least 6 characters long.' });
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordMsg(null);
      const res = await api.put('/auth/change-password', {
        oldPassword,
        newPassword
      });
      if (res.data.success) {
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setSavingPassword(false);
      setTimeout(() => setPasswordMsg(null), 3500);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold text-dark brand-font mb-4">Account Settings</h2>

      <div className="row g-4">
        {/* Profile Info Form */}
        <div className="col-lg-6">
          <div className="surface-card p-4">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <User size={20} className="text-success" /> Personal Details & Address
            </h5>

            {profileMsg && (
              <div className={`alert alert-${profileMsg.type} py-2 small mb-3`}>
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Email Address</label>
                <input
                  type="email"
                  className="form-control bg-light"
                  value={user?.email || ''}
                  disabled
                />
                <div className="form-text small">Email cannot be changed directly.</div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Mobile Contact</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <h6 className="fw-bold text-dark small mt-4 mb-2">Default Delivery Address</h6>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Street</label>
                <input
                  type="text"
                  className="form-control"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Flat, House No., Building"
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-5">
                  <label className="form-label small fw-semibold text-secondary">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-semibold text-secondary">State</label>
                  <input
                    type="text"
                    className="form-control"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div className="col-3">
                  <label className="form-label small fw-semibold text-secondary">PIN</label>
                  <input
                    type="text"
                    className="form-control"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="d-grid mt-4">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn btn-primary-custom py-2 d-flex align-items-center justify-content-center gap-2"
                >
                  <Save size={16} />
                  <span>{savingProfile ? 'Saving Changes...' : 'Save Profile Details'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="col-lg-6">
          <div className="surface-card p-4">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Lock size={20} className="text-primary" /> Change Password
            </h5>

            {passwordMsg && (
              <div className={`alert alert-${passwordMsg.type} py-2 small mb-3`}>
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="alert alert-light border small text-muted mb-4">
                Updating your password will immediately invalidate any older active sessions across other devices for security.
              </div>

              <div className="d-grid">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="btn btn-outline-custom py-2 d-flex align-items-center justify-content-center gap-2"
                >
                  <Lock size={16} />
                  <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
