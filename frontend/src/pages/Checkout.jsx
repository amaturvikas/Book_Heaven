import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Truck, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0] || {};

  const [address, setAddress] = useState({
    street: defaultAddr.street || '',
    city: defaultAddr.city || '',
    state: defaultAddr.state || '',
    zipCode: defaultAddr.zipCode || '',
    phone: user?.phone || ''
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const items = cart?.items || [];
  const purchaseItems = items.filter((i) => i.itemType === 'buy');
  const rentalItems = items.filter((i) => i.itemType === 'rent');

  const deliveryFee = totalPrice > 500 || items.length === 0 ? 0 : 40;
  const grandTotal = totalPrice + deliveryFee;

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!address.street || !address.city || !address.zipCode || !address.phone) {
      setError('Please fill out all required address fields.');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Online payment via Razorpay test mode
      if (paymentMethod === 'Razorpay') {
        const orderRes = await api.post('/payments/create-order', {
          amount: grandTotal,
          currency: 'INR'
        });

        if (!orderRes.data.razorpayEnabled) {
          setError(orderRes.data.message || 'Razorpay test mode is unconfigured in backend .env. Please select Cash on Delivery (COD).');
          setLoading(false);
          return;
        }

        const { razorpayOrder } = orderRes.data;

        // Open Razorpay Popup
        const options = {
          key: razorpayOrder.keyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'Book Heaven',
          description: 'Payment for Book Heaven Order / Rental',
          order_id: razorpayOrder.id,
          handler: async function (response) {
            try {
              // Create Purchase Orders if any
              if (purchaseItems.length > 0) {
                await api.post('/orders', {
                  items: purchaseItems.map((p) => ({ bookId: p.book._id, quantity: p.quantity })),
                  shippingAddress: address,
                  paymentMethod: 'Razorpay'
                });
              }

              // Create Rentals if any
              for (const r of rentalItems) {
                await api.post('/rentals', {
                  bookId: r.book._id,
                  rentalDays: r.rentalDays,
                  quantity: r.quantity,
                  shippingAddress: address,
                  paymentMethod: 'Razorpay'
                });
              }

              // Verify signature
              await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: grandTotal
              });

              await clearCart();
              navigate('/my-orders?success=order_placed');
            } catch (postErr) {
              setError('Payment succeeded but order recording encountered an error: ' + postErr.message);
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: address.phone
          },
          theme: {
            color: '#15803d'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (failRes) {
          setError(`Payment failed: ${failRes.error.description}`);
          setLoading(false);
        });
        rzp.open();
        setLoading(false);
        return;
      }

      // COD Workflow
      // 1. Process purchase orders
      if (purchaseItems.length > 0) {
        await api.post('/orders', {
          items: purchaseItems.map((p) => ({ bookId: p.book._id, quantity: p.quantity })),
          shippingAddress: address,
          paymentMethod: 'COD'
        });
      }

      // 2. Process rental bookings
      for (const r of rentalItems) {
        await api.post('/rentals', {
          bookId: r.book._id,
          rentalDays: r.rentalDays,
          quantity: r.quantity,
          shippingAddress: address,
          paymentMethod: 'COD'
        });
      }

      await clearCart();
      navigate('/my-orders?success=order_placed');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold mb-3">Your cart is empty</h4>
        <Link to="/books" className="btn btn-primary-custom">
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold text-dark brand-font mb-4">Checkout & Delivery Details</h2>

      {error && (
        <div className="alert alert-danger py-2 small mb-4 d-flex align-items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div className="row g-4">
          {/* Left Column: Delivery Address & Payment Method */}
          <div className="col-lg-7">
            {/* Address Card */}
            <div className="surface-card p-4 mb-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Truck size={20} className="text-success" />
                <h5 className="fw-bold text-dark mb-0">Delivery Address</h5>
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">
                    Street Address / House / Flat *
                  </label>
                  <input
                    type="text"
                    name="street"
                    className="form-control"
                    placeholder="e.g. 42 Main Street, Apartment 3B"
                    value={address.street}
                    onChange={handleAddressChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">City *</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    placeholder="e.g. New Delhi"
                    value={address.city}
                    onChange={handleAddressChange}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-semibold text-secondary">State *</label>
                  <input
                    type="text"
                    name="state"
                    className="form-control"
                    placeholder="Delhi"
                    value={address.state}
                    onChange={handleAddressChange}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-semibold text-secondary">PIN Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    className="form-control"
                    placeholder="110001"
                    value={address.zipCode}
                    onChange={handleAddressChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">
                    Delivery Contact Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="9876543210"
                    value={address.phone}
                    onChange={handleAddressChange}
                    required
                  />
                  <div className="form-text small">Our delivery agent will call this number before arrival.</div>
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="surface-card p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <ShieldCheck size={20} className="text-primary" />
                <h5 className="fw-bold text-dark mb-0">Payment Options</h5>
              </div>

              <div className="d-flex flex-column gap-3">
                <label className={`p-3 border rounded-3 cursor-pointer d-flex align-items-center justify-content-between ${paymentMethod === 'COD' ? 'border-success bg-success-subtle bg-opacity-10' : ''}`}>
                  <div className="d-flex align-items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="form-check-input"
                    />
                    <div>
                      <strong className="d-block text-dark">Cash on Delivery (COD)</strong>
                      <span className="small text-muted">Pay in cash or UPI when your books are delivered at your doorstep.</span>
                    </div>
                  </div>
                  <span className="badge bg-secondary">Recommended for Demo</span>
                </label>

                <label className={`p-3 border rounded-3 cursor-pointer d-flex align-items-center justify-content-between ${paymentMethod === 'Razorpay' ? 'border-success bg-success-subtle bg-opacity-10' : ''}`}>
                  <div className="d-flex align-items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Razorpay"
                      checked={paymentMethod === 'Razorpay'}
                      onChange={() => setPaymentMethod('Razorpay')}
                      className="form-check-input"
                    />
                    <div>
                      <strong className="d-block text-dark">Razorpay Test Gateway (Online)</strong>
                      <span className="small text-muted">Pay securely with Test Cards, UPI, or NetBanking.</span>
                    </div>
                  </div>
                  <span className="badge bg-primary">Online</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review */}
          <div className="col-lg-5">
            <div className="surface-card p-4">
              <h5 className="fw-bold text-dark mb-3">Review Items</h5>

              <div className="mb-3" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {items.map((item) => (
                  <div key={item._id} className="d-flex justify-content-between py-2 border-bottom small">
                    <div>
                      <span className="fw-bold text-dark">{item.book?.title}</span>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {item.itemType === 'buy' ? 'Purchase' : `Rental (${item.rentalDays}d)`} x {item.quantity}
                      </div>
                    </div>
                    <span className="fw-semibold text-dark">
                      ₹{item.priceSnapshot * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between py-2 border-bottom small">
                <span className="text-muted">Subtotal:</span>
                <span className="fw-semibold">₹{totalPrice.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between py-2 border-bottom small">
                <span className="text-muted">Doorstep Delivery:</span>
                <span className="fw-semibold">
                  {deliveryFee === 0 ? <span className="text-success">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="d-flex justify-content-between py-3 mb-4">
                <strong className="fs-5 text-dark">Grand Total:</strong>
                <strong className="fs-5 text-success">₹{grandTotal.toFixed(2)}</strong>
              </div>

              <div className="d-grid">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary-custom py-2 d-flex align-items-center justify-content-center gap-2"
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Confirm & Place Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
