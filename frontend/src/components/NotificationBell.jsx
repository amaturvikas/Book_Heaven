import React, { useState, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      // Silently fail if not logged in
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Poll every 20 seconds
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="position-relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-outline-custom position-relative p-2"
        title="Notifications"
        type="button"
      >
        <Bell size={18} className="text-secondary" />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border p-0 notification-menu"
          style={{ zIndex: 1050, minWidth: '310px' }}
        >
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light rounded-top-3">
            <h6 className="mb-0 fw-bold small">Notifications ({unreadCount})</h6>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="btn btn-link btn-sm p-0 text-decoration-none small text-success">
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                No notifications right now
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3 border-bottom small ${n.isRead ? 'bg-white' : 'bg-success-subtle bg-opacity-10'}`}
                >
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <strong className="text-dark">{n.title}</strong>
                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n._id)}
                        className="btn btn-link p-0 text-muted ms-2"
                        title="Mark read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-secondary mb-1" style={{ fontSize: '0.82rem' }}>
                    {n.message}
                  </p>
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {n.link && (
                      <Link
                        to={n.link}
                        onClick={() => {
                          markAsRead(n._id);
                          setIsOpen(false);
                        }}
                        className="text-success text-decoration-none fw-bold"
                        style={{ fontSize: '0.75rem' }}
                      >
                        View &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
