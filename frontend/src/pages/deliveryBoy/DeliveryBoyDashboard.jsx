import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Package, RotateCcw, CheckCircle, Clock, ArrowRight, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const DeliveryBoyDashboard = () => {
  const { deliveryBoy } = useAuth();
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [returnPickups, setReturnPickups] = useState([]);
  const [historyCount, setHistoryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [activeRes, historyRes, returnRes] = await Promise.all([
          api.get('/deliveries/delivery-boy/active'),
          api.get('/deliveries/delivery-boy/history'),
          api.get('/deliveries/delivery-boy/return-pickups')
        ]);

        if (activeRes.data.success) {
          setActiveDeliveries(activeRes.data.deliveries);
        }
        if (historyRes.data.success) {
          setHistoryCount(historyRes.data.deliveries.length);
        }
        if (returnRes.data.success) {
          setReturnPickups(returnRes.data.returnPickups);
        }
      } catch (err) {
        console.error('Failed to load delivery boy dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingReturns = returnPickups.filter((r) => r.status !== 'Delivered');

  return (
    <div className="container py-4">
      {/* Header Banner */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <span className="badge bg-info text-white px-2 py-1 mb-1">Field Agent Portal</span>
          <h2 className="fw-bold text-dark brand-font mb-0">
            Welcome back, {deliveryBoy?.name || 'Agent'}!
          </h2>
          <span className="text-muted small">
            Employee ID: <strong>{deliveryBoy?.employeeId}</strong> • Vehicle: <strong>{deliveryBoy?.vehicleDetails?.vehicleType || 'Bike'}</strong>
          </span>
        </div>
        <div className="d-flex gap-2">
          <Link to="/delivery-boy/return-pickups" className="btn btn-warning btn-sm d-flex align-items-center gap-1">
            <RotateCcw size={15} />
            <span>Return Pickups ({pendingReturns.length})</span>
          </Link>
          <Link to="/delivery-boy/profile" className="btn btn-outline-custom btn-sm">
            Vehicle & Profile &rarr;
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <Link to="/delivery-boy/my-deliveries" className="text-decoration-none">
            <div className="kpi-card border-primary">
              <div className="kpi-icon-wrapper bg-primary-subtle text-primary">
                <Truck size={24} />
              </div>
              <div>
                <span className="text-muted small d-block">ACTIVE OUTBOUND TASKS</span>
                <h3 className="fw-bold mb-0 text-dark">{activeDeliveries.length}</h3>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-sm-4">
          <Link to="/delivery-boy/return-pickups" className="text-decoration-none">
            <div className="kpi-card border-warning">
              <div className="kpi-icon-wrapper bg-warning-subtle text-warning">
                <RotateCcw size={24} />
              </div>
              <div>
                <span className="text-muted small d-block">RENTAL RETURN PICKUPS</span>
                <h3 className="fw-bold mb-0 text-dark">{returnPickups.length}</h3>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-sm-4">
          <Link to="/delivery-boy/history" className="text-decoration-none">
            <div className="kpi-card border-success">
              <div className="kpi-icon-wrapper bg-success-subtle text-success">
                <CheckCircle size={24} />
              </div>
              <div>
                <span className="text-muted small d-block">COMPLETED IN HISTORY</span>
                <h3 className="fw-bold mb-0 text-dark">{historyCount}</h3>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Return Pickups Queue if any */}
      {pendingReturns.length > 0 && (
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <RotateCcw size={18} className="text-warning" />
              <span>Assigned Rental Return Pickups ({pendingReturns.length})</span>
            </h5>
            <Link to="/delivery-boy/return-pickups" className="small text-warning fw-bold text-decoration-none">
              View Return Portal &rarr;
            </Link>
          </div>

          <div className="d-flex flex-column gap-3">
            {pendingReturns.slice(0, 3).map((ret) => (
              <div key={ret._id} className="surface-card p-3 border-warning bg-warning-subtle bg-opacity-10">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-2 border-bottom mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-warning text-dark">Return Pickup</span>
                    <strong className="text-dark">#{ret.deliveryNumber}</strong>
                  </div>
                  <span className={`badge status-badge-${ret.status} px-2 py-1`}>
                    Return Status: {ret.status}
                  </span>
                </div>
                <div className="row g-2 align-items-center">
                  <div className="col-md-8 small">
                    <strong>Customer:</strong> {ret.customerName} ({ret.customerPhone})<br />
                    <strong>Pickup From:</strong> {ret.pickupLocation}
                  </div>
                  <div className="col-md-4 text-md-end">
                    <Link
                      to={`/delivery-boy/deliveries/${ret._id}`}
                      className="btn btn-warning btn-sm fw-bold d-inline-flex align-items-center gap-1"
                    >
                      <span>Update Return</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Tasks Queue */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold text-dark mb-0">Assigned Outbound Deliveries</h5>
        <Link to="/delivery-boy/my-deliveries" className="small text-success text-decoration-none">
          View all &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status"></div>
          <div className="text-muted small mt-2">Loading assigned deliveries...</div>
        </div>
      ) : activeDeliveries.length === 0 ? (
        <div className="text-center py-5 surface-card my-3">
          <CheckCircle size={48} className="text-success mb-2" />
          <h5 className="text-dark">All Caught Up!</h5>
          <p className="text-muted small">No pending deliveries currently assigned to your account.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3 mb-4">
          {activeDeliveries.map((del) => (
            <div key={del._id} className="surface-card p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-2 border-bottom mb-3">
                <div>
                  <span className="badge bg-light text-dark border me-2">{del.type}</span>
                  <strong className="text-dark">#{del.deliveryNumber}</strong>
                </div>
                <span className={`badge status-badge-${del.status} px-3 py-1 font-weight-bold`}>
                  {del.status}
                </span>
              </div>

              <div className="row g-3 align-items-center">
                <div className="col-md-7">
                  <h6 className="fw-bold text-dark mb-1">{del.customerName}</h6>
                  <div className="small text-secondary mb-2 d-flex align-items-center gap-1">
                    <MapPin size={14} className="text-danger flex-shrink-0" />
                    <span>{del.deliveryAddress.street}, {del.deliveryAddress.city} - {del.deliveryAddress.zipCode}</span>
                  </div>
                  <div className="small text-muted d-flex align-items-center gap-1">
                    <Phone size={14} className="text-success flex-shrink-0" />
                    <a href={`tel:${del.customerPhone}`} className="text-success fw-bold text-decoration-none">
                      {del.customerPhone} (Click to Call)
                    </a>
                  </div>
                </div>

                <div className="col-md-5 text-md-end">
                  <div className="small text-muted mb-2">
                    Items: {del.items ? del.items.map((i) => `${i.title} (x${i.quantity})`).join(', ') : 'Books'}
                  </div>
                  <Link
                    to={`/delivery-boy/deliveries/${del._id}`}
                    className="btn btn-primary-custom btn-sm d-inline-flex align-items-center gap-1"
                  >
                    <span>Update Task Status</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryBoyDashboard;
