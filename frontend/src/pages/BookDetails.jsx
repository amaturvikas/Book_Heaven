import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Clock, Check, ArrowLeft, ShieldCheck, Truck, BookOpen } from 'lucide-react';
import api, { getCoverImageUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Purchase state
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [addingBuy, setAddingBuy] = useState(false);

  // Rental state
  const [rentalDays, setRentalDays] = useState(7);
  const [rentalQuantity, setRentalQuantity] = useState(1);
  const [addingRent, setAddingRent] = useState(false);

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/books/${id}`);
        if (res.data.success) {
          setBook(res.data.book);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load book details.');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const fallbackImage = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';

  const handleBuy = async (redirectCheckout = false) => {
    if (!user) {
      navigate(`/login?redirect=/books/${id}`);
      return;
    }
    try {
      setAddingBuy(true);
      await addToCart(book._id, 'buy', 7, buyQuantity);
      if (redirectCheckout) {
        navigate('/checkout');
      } else {
        setFeedback({ type: 'success', text: `Added ${buyQuantity} copy/copies to cart for purchase!` });
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch (err) {
      setFeedback({ type: 'danger', text: err.response?.data?.message || err.message });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setAddingBuy(false);
    }
  };

  const handleRent = async (redirectCheckout = false) => {
    if (!user) {
      navigate(`/login?redirect=/books/${id}`);
      return;
    }
    try {
      setAddingRent(true);
      await addToCart(book._id, 'rent', rentalDays, rentalQuantity);
      if (redirectCheckout) {
        navigate('/checkout');
      } else {
        setFeedback({ type: 'success', text: `Added ${rentalQuantity} copy/copies for a ${rentalDays}-day rental!` });
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch (err) {
      setFeedback({ type: 'danger', text: err.response?.data?.message || err.message });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setAddingRent(false);
    }
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-success" role="status"></div>
        <div className="text-muted small mt-2">Loading book details...</div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger d-inline-block px-4 py-3">
          {error || 'Book not found.'}
        </div>
        <div>
          <Link to="/books" className="btn btn-outline-custom mt-3">
            <ArrowLeft size={16} className="me-1" /> Back to Catalogue
          </Link>
        </div>
      </div>
    );
  }

  const calculatedRentalTotal = book.rentalPricePerDay * rentalDays * rentalQuantity;

  return (
    <div className="container py-4">
      <Link to="/books" className="btn btn-outline-custom btn-sm mb-4 d-inline-flex align-items-center gap-1">
        <ArrowLeft size={15} /> Back to Catalogue
      </Link>

      {feedback && (
        <div className={`alert alert-${feedback.type} mb-4 d-flex align-items-center gap-2`}>
          {feedback.type === 'success' ? <Check size={18} /> : null}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="row g-4 mb-5">
        {/* Book Cover Column */}
        <div className="col-lg-4 col-md-5 text-center">
          <div className="surface-card p-3 d-inline-block w-100">
            <img
              src={getCoverImageUrl(book.coverImage, fallbackImage)}
              alt={book.title}
              className="img-fluid rounded-3 shadow-sm border w-100"
              style={{ maxHeight: '460px', objectFit: 'cover' }}
              onError={(e) => { e.target.src = fallbackImage; }}
            />
          </div>

          <div className="surface-card p-3 mt-3 text-start small text-muted">
            <div className="d-flex justify-content-between py-1 border-bottom">
              <span>Category:</span>
              <strong className="text-dark">{book.category}</strong>
            </div>
            <div className="d-flex justify-content-between py-1 border-bottom">
              <span>Publisher:</span>
              <strong className="text-dark">{book.publisher || 'Book Heaven'}</strong>
            </div>
            <div className="d-flex justify-content-between py-1 border-bottom">
              <span>Published Year:</span>
              <strong className="text-dark">{book.publishedYear || 2024}</strong>
            </div>
            {book.isbn && (
              <div className="d-flex justify-content-between py-1">
                <span>ISBN:</span>
                <strong className="text-dark">{book.isbn}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Book Details and Action Tabs Column */}
        <div className="col-lg-8 col-md-7">
          <div className="surface-card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
              <span className="badge-category">{book.category}</span>
              {book.availableStock > 0 ? (
                <span className="badge bg-success-subtle text-success border border-success-subtle">
                  In Stock ({book.availableStock} copies available)
                </span>
              ) : (
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                  Currently Out of Stock
                </span>
              )}
            </div>

            <h2 className="fw-bold text-dark mb-1 brand-font">{book.title}</h2>
            <h5 className="text-secondary mb-3">By {book.author}</h5>

            <p className="text-secondary mb-4 leading-relaxed">
              {book.description}
            </p>

            <hr className="my-4" />

            {/* Choose Mode: Purchase vs Rental */}
            <div className="row g-4">
              {/* Purchase Card */}
              <div className="col-lg-6">
                <div className="border rounded-3 p-3 bg-light h-100 d-flex flex-column">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <ShoppingBag size={20} className="text-success" />
                    <h6 className="fw-bold mb-0">Buy Permanently</h6>
                  </div>
                  <div className="display-6 fw-bold text-success mb-3">
                    ₹{book.purchasePrice}
                  </div>

                  <div className="mb-3 mt-auto">
                    <label className="form-label small fw-semibold text-muted">Quantity</label>
                    <select
                      className="form-select form-select-sm"
                      value={buyQuantity}
                      onChange={(e) => setBuyQuantity(parseInt(e.target.value, 10))}
                      disabled={book.availableStock <= 0}
                    >
                      {[...Array(Math.min(book.availableStock, 10)).keys()].map((n) => (
                        <option key={n + 1} value={n + 1}>
                          {n + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      onClick={() => handleBuy(false)}
                      disabled={book.availableStock <= 0 || addingBuy}
                      className="btn btn-outline-success btn-sm d-flex align-items-center justify-content-center gap-1"
                    >
                      <ShoppingBag size={15} />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => handleBuy(true)}
                      disabled={book.availableStock <= 0 || addingBuy}
                      className="btn btn-primary-custom btn-sm"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Rental Card */}
              <div className="col-lg-6">
                <div className="border rounded-3 p-3 bg-light h-100 d-flex flex-column">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Clock size={20} className="text-primary" />
                    <h6 className="fw-bold mb-0">Rent by Duration</h6>
                  </div>
                  <div className="display-6 fw-bold text-primary mb-1">
                    ₹{book.rentalPricePerDay}
                    <span className="small text-muted fs-6 font-weight-normal"> / day</span>
                  </div>

                  <div className="mb-3 mt-2">
                    <label className="form-label small fw-semibold text-muted d-flex justify-content-between">
                      <span>Rental Duration:</span>
                      <strong className="text-dark">{rentalDays} Days</strong>
                    </label>
                    <div className="d-flex gap-1 mb-2">
                      {[7, 14, 21, 30].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setRentalDays(days)}
                          className={`btn btn-sm flex-fill ${rentalDays === days ? 'btn-primary' : 'btn-outline-secondary'}`}
                        >
                          {days}d
                        </button>
                      ))}
                    </div>
                    <div className="p-2 bg-white rounded border small d-flex justify-content-between align-items-center">
                      <span>Total Rental Fee:</span>
                      <strong className="text-primary fs-6">₹{calculatedRentalTotal}</strong>
                    </div>
                  </div>

                  <div className="d-grid gap-2 mt-auto">
                    <button
                      onClick={() => handleRent(false)}
                      disabled={book.availableStock <= 0 || addingRent}
                      className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center gap-1"
                    >
                      <Clock size={15} />
                      <span>Add Rental to Cart</span>
                    </button>
                    <button
                      onClick={() => handleRent(true)}
                      disabled={book.availableStock <= 0 || addingRent}
                      className="btn btn-navy-custom btn-sm"
                    >
                      Rent Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Security Guarantees */}
          <div className="surface-card p-3">
            <div className="row g-3 small text-muted">
              <div className="col-sm-4 d-flex align-items-center gap-2">
                <Truck size={20} className="text-success" />
                <span>Doorstep delivery & return pickup</span>
              </div>
              <div className="col-sm-4 d-flex align-items-center gap-2">
                <ShieldCheck size={20} className="text-primary" />
                <span>Verified original condition</span>
              </div>
              <div className="col-sm-4 d-flex align-items-center gap-2">
                <Clock size={20} className="text-warning" />
                <span>Automated due-date reminders</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
