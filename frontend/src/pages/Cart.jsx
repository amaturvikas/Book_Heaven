import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getCoverImageUrl } from '../services/api';

const Cart = () => {
  const { cart, loading, updateQuantity, updateRentalDays, removeFromCart, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();

  const fallbackImage = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-success" role="status"></div>
        <div className="text-muted small mt-2">Loading your cart...</div>
      </div>
    );
  }

  const items = cart && cart.items ? cart.items : [];
  const deliveryFee = totalPrice > 500 || items.length === 0 ? 0 : 40;
  const finalTotal = totalPrice + deliveryFee;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark brand-font mb-0">Your Shopping Cart</h2>
          <span className="text-muted small">Purchases & Book Rentals</span>
        </div>
        {items.length > 0 && (
          <button onClick={clearCart} className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1">
            <Trash2 size={14} /> Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-5 surface-card my-4">
          <ShoppingBag size={52} className="text-muted mb-3" />
          <h4 className="fw-bold text-dark mb-2">Your cart is currently empty</h4>
          <p className="text-muted small mb-4">
            Browse our books catalogue to purchase copies or rent them flexibly by the day!
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/books" className="btn btn-primary-custom">
              Browse Books
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Cart Items List */}
          <div className="col-lg-8">
            <div className="surface-card p-3 p-sm-4">
              {items.map((item) => {
                const book = item.book;
                if (!book) return null;

                const isRent = item.itemType === 'rent';
                const itemTotal = item.priceSnapshot * item.quantity;

                return (
                  <div key={item._id} className="row g-3 py-3 border-bottom align-items-center">
                    {/* Book Thumbnail */}
                    <div className="col-3 col-sm-2">
                      <img
                        src={getCoverImageUrl(book.coverImage, fallbackImage)}
                        alt={book.title}
                        className="img-fluid rounded border"
                        style={{ height: '90px', objectFit: 'cover', width: '100%' }}
                        onError={(e) => { e.target.src = fallbackImage; }}
                      />
                    </div>

                    {/* Book Info */}
                    <div className="col-9 col-sm-4">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        {isRent ? (
                          <span className="badge-rental d-inline-flex align-items-center gap-1">
                            <Clock size={11} /> Rental ({item.rentalDays}d)
                          </span>
                        ) : (
                          <span className="badge bg-success-subtle text-success border border-success-subtle small">
                            Purchase
                          </span>
                        )}
                        <span className="badge-category">{book.category}</span>
                      </div>
                      <h6 className="fw-bold mb-1 text-truncate">
                        <Link to={`/books/${book._id}`} className="text-decoration-none text-dark">
                          {book.title}
                        </Link>
                      </h6>
                      <div className="small text-muted text-truncate">{book.author}</div>
                    </div>

                    {/* Rental Duration / Quantity adjustment */}
                    <div className="col-6 col-sm-3">
                      {isRent && (
                        <div className="mb-2">
                          <label className="small text-muted d-block" style={{ fontSize: '0.72rem' }}>Duration:</label>
                          <select
                            className="form-select form-select-sm"
                            value={item.rentalDays}
                            onChange={(e) => updateRentalDays(item._id, parseInt(e.target.value, 10))}
                          >
                            <option value={7}>7 Days (₹{book.rentalPricePerDay * 7})</option>
                            <option value={14}>14 Days (₹{book.rentalPricePerDay * 14})</option>
                            <option value={21}>21 Days (₹{book.rentalPricePerDay * 21})</option>
                            <option value={30}>30 Days (₹{book.rentalPricePerDay * 30})</option>
                          </select>
                        </div>
                      )}

                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm px-2 py-0"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="small fw-bold px-1">{item.quantity}</span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm px-2 py-0"
                          disabled={item.quantity >= book.availableStock}
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price and Delete */}
                    <div className="col-6 col-sm-3 text-end">
                      <div className="fw-bold text-dark fs-6">₹{itemTotal}</div>
                      <div className="small text-muted mb-2" style={{ fontSize: '0.72rem' }}>
                        (₹{item.priceSnapshot} each)
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="btn btn-link text-danger p-0 small text-decoration-none"
                      >
                        <Trash2 size={15} /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="col-lg-4">
            <div className="surface-card p-4">
              <h5 className="fw-bold text-dark mb-3">Order Summary</h5>

              <div className="d-flex justify-content-between py-2 border-bottom small">
                <span className="text-secondary">Items Subtotal:</span>
                <span className="fw-semibold text-dark">₹{totalPrice.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between py-2 border-bottom small">
                <span className="text-secondary">Doorstep Delivery:</span>
                <span className="fw-semibold text-dark">
                  {deliveryFee === 0 ? <span className="text-success">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="d-flex justify-content-between py-3 mb-3">
                <strong className="fs-5 text-dark">Total Amount:</strong>
                <strong className="fs-5 text-success">₹{finalTotal.toFixed(2)}</strong>
              </div>

              <div className="d-grid mb-3">
                <button
                  onClick={() => navigate('/checkout')}
                  className="btn btn-primary-custom py-2 d-flex align-items-center justify-content-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="small text-muted text-center">
                Cash on Delivery & Razorpay Test Checkout available.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
