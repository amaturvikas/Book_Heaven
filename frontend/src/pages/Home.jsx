import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Truck, ShieldCheck, Clock, ArrowRight, Sparkles } from 'lucide-react';
import api from '../services/api';
import BookCard from '../components/BookCard';

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/books?featured=true&limit=8');
        if (res.data.success) {
          setFeaturedBooks(res.data.books);
        }
      } catch (err) {
        console.error('Failed to load featured books:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="pb-5">
      {/* Hero Section */}
      <section className="bg-white border-bottom py-5">
        <div className="container py-lg-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill mb-3 fw-semibold d-inline-flex align-items-center gap-1">
                <Sparkles size={14} /> Comprehensive Bookstore, Rental & Delivery Platform
              </span>
              <h1 className="display-4 fw-bold text-dark mb-3 brand-font">
                Your Sanctuary for Books, Rentals & Seamless Delivery.
              </h1>
              <p className="lead text-secondary mb-4">
                Discover your next read from our curated catalogue. Purchase permanently or rent flexibly by the day with full doorstep delivery and live order tracking.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/books" className="btn btn-primary-custom btn-lg d-flex align-items-center gap-2">
                  <span>Browse Books</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            <div className="col-lg-5 text-center">
              <div className="position-relative d-inline-block">
                
                <div className="position-absolute bottom-0 start-0 m-3 p-3 bg-white rounded-3 shadow border text-start d-none d-sm-block">
                  <div className="d-flex align-items-center gap-2">
                    <div className="p-2 bg-success text-white rounded-circle">
                      <Truck size={16} />
                    </div>
                    <div>
                      <div className="fw-bold small text-dark">Live Delivery Tracking</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Full lifecycle assignment & status</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Strip */}
      <section className="py-4 bg-light border-bottom">
        <div className="container">
          <div className="row g-4 text-center text-md-start">
            <div className="col-md-3 col-sm-6">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-white rounded-3 shadow-sm border text-success">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0">Buy or Rent</h6>
                  <small className="text-muted">Own books or rent by day</small>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-white rounded-3 shadow-sm border text-primary">
                  <Truck size={24} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0">Delivery Management</h6>
                  <small className="text-muted">Dedicated delivery boy tasks</small>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-white rounded-3 shadow-sm border text-warning">
                  <Clock size={24} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0">Return Pickups</h6>
                  <small className="text-muted">Scheduled doorstep collection</small>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-white rounded-3 shadow-sm border text-danger">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0">Secure Checkouts</h6>
                  <small className="text-muted">Razorpay & COD supported</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
            <div>
              <span className="text-success fw-bold small text-uppercase tracking-wider">Editor's Picks</span>
              <h2 className="fw-bold text-dark mb-0 brand-font">Featured Local Books</h2>
            </div>
            <Link to="/books" className="btn btn-outline-custom d-flex align-items-center gap-1">
              <span>View All Catalogue</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status"></div>
              <div className="text-muted small mt-2">Loading catalogue from MongoDB...</div>
            </div>
          ) : featuredBooks.length === 0 ? (
            <div className="text-center py-5 surface-card">
              <BookOpen size={48} className="text-muted mb-2" />
              <h5 className="text-dark">No featured books yet</h5>
              <p className="text-muted small">Please run the seed script to populate books.</p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              {featuredBooks.map((book) => (
                <div key={book._id} className="col">
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Browse Categories Showcase */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill mb-2 fw-semibold">
                Explore Genres
              </span>
              <h2 className="fw-bold text-dark mb-3 brand-font">
                Rich Selection Across Popular Genres
              </h2>
              <p className="text-secondary mb-4">
                Explore our curated library spanning fiction, romance, thrillers, history, science, technology, and more. Filter by category, sort by price or popularity, and choose flexible rental durations.
              </p>
              <div className="d-flex gap-3">
                <Link to="/books" className="btn btn-navy-custom d-flex align-items-center gap-2">
                  <BookOpen size={18} />
                  <span>Browse All Books</span>
                </Link>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="p-4 bg-light rounded-4 border">
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {['Fiction', 'Romance', 'Mystery', 'Science Fiction', 'History', 'Technology', 'Business', 'Self-Help'].map((cat) => (
                    <Link
                      key={cat}
                      to={`/books?category=${encodeURIComponent(cat)}`}
                      className="badge bg-white text-dark border p-2 text-decoration-none"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
                <div className="small text-muted fst-italic">
                  *All books are physically stocked in our local fulfillment center, ready for immediate dispatch and doorstep delivery.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
