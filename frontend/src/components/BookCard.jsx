import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Clock, Check, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getCoverImageUrl } from '../services/api';

const BookCard = ({ book }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addingBuy, setAddingBuy] = useState(false);
  const [addingRent, setAddingRent] = useState(false);
  const [message, setMessage] = useState(null);

  const fallbackImage = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';

  const handleBuy = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=/books');
      return;
    }
    try {
      setAddingBuy(true);
      await addToCart(book._id, 'buy', 7, 1);
      setMessage({ type: 'success', text: 'Added to cart for purchase!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || err.message });
      setTimeout(() => setMessage(null), 3500);
    } finally {
      setAddingBuy(false);
    }
  };

  const handleRent = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=/books');
      return;
    }
    try {
      setAddingRent(true);
      await addToCart(book._id, 'rent', 7, 1);
      setMessage({ type: 'success', text: 'Added to cart for 7-day rental!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || err.message });
      setTimeout(() => setMessage(null), 3500);
    } finally {
      setAddingRent(false);
    }
  };

  return (
    <div className="book-card position-relative">
      {/* Category & Stock Badges */}
      <div className="position-absolute top-0 start-0 m-2 d-flex flex-column gap-1" style={{ zIndex: 2 }}>
        <span className="badge-category">{book.category}</span>
        {book.isFeatured && <span className="badge-featured">Featured</span>}
      </div>

      <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 2 }}>
        {book.availableStock > 0 ? (
          <span className="badge bg-success-subtle text-success border border-success-subtle small">
            {book.availableStock} in stock
          </span>
        ) : (
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle small">
            Out of Stock
          </span>
        )}
      </div>

      <Link to={`/books/${book._id}`} className="text-decoration-none text-dark">
        <img
          src={getCoverImageUrl(book.coverImage, fallbackImage)}
          alt={book.title}
          className="book-cover-img"
          onError={(e) => { e.target.src = fallbackImage; }}
        />
      </Link>

      <div className="p-3 d-flex flex-column flex-grow-1">
        <h6 className="fw-bold mb-1 text-truncate" title={book.title}>
          <Link to={`/books/${book._id}`} className="text-decoration-none text-dark">
            {book.title}
          </Link>
        </h6>
        <div className="small text-muted mb-2 text-truncate">{book.author}</div>

        <p className="small text-secondary mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {book.description}
        </p>

        {/* Price Row */}
        <div className="d-flex justify-content-between align-items-center mb-3 pt-2 border-top">
          <div>
            <div className="small text-muted" style={{ fontSize: '0.72rem' }}>PURCHASE</div>
            <div className="fw-bold text-success fs-6">₹{book.purchasePrice}</div>
          </div>
          <div className="text-end">
            <div className="small text-muted" style={{ fontSize: '0.72rem' }}>RENT / DAY</div>
            <div className="fw-bold text-primary fs-6">₹{book.rentalPricePerDay}</div>
          </div>
        </div>

        {/* Toast / Notification feedback */}
        {message && (
          <div className={`alert alert-${message.type} py-1 px-2 mb-2 small text-center`}>
            {message.text}
          </div>
        )}

        {/* Action Buttons */}
        <div className="d-grid gap-2">
          <div className="row g-2">
            <div className="col-6">
              <button
                onClick={handleBuy}
                disabled={book.availableStock <= 0 || addingBuy}
                className="btn btn-primary-custom btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                title="Add to cart for purchase"
              >
                <ShoppingBag size={14} />
                <span>Buy</span>
              </button>
            </div>
            <div className="col-6">
              <button
                onClick={handleRent}
                disabled={book.availableStock <= 0 || addingRent}
                className="btn btn-outline-custom btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                title="Rent for 7 days"
              >
                <Clock size={14} className="text-primary" />
                <span>Rent</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
