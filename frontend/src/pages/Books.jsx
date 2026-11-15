import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import api from '../services/api';
import BookCard from '../components/BookCard';

const CATEGORIES = [
  'All',
  'Fiction',
  'Romance',
  'Mystery',
  'Fantasy',
  'Science Fiction',
  'History',
  'Biography',
  'Business',
  'Technology',
  'Education',
  'Children',
  'Comics',
  'Self-Help'
];

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        sort: sortBy
      };

      if (search.trim()) {
        params.q = search.trim();
      }

      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      const res = await api.get('/books', { params });
      if (res.data.success) {
        setBooks(res.data.books);
        setTotalPages(res.data.totalPages || 1);
        setTotalBooks(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [selectedCategory, sortBy, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBooks();
  };

  return (
    <div className="container py-4">
      {/* Header & Search */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark brand-font mb-2">Book Catalogue</h2>
        <p className="text-secondary small mb-3">
          Browse, purchase, or rent books from our verified in-house catalogue.
        </p>

        <div className="row g-3 align-items-center">
          <div className="col-lg-6 col-md-7">
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Search size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search by title, author, ISBN, or keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="btn btn-primary-custom">
                  Search
                </button>
              </div>
            </form>
          </div>

          <div className="col-lg-6 col-md-5 d-flex justify-content-md-end align-items-center gap-2">
            <span className="small text-muted d-none d-sm-inline">Sort by:</span>
            <select
              className="form-select form-select-sm w-auto"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="newest">Recently Added</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Stock / Popularity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="d-flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
            className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results summary */}
      <div className="d-flex justify-content-between align-items-center mb-3 text-muted small">
        <span>Found {totalBooks} books</span>
        {selectedCategory !== 'All' && <span>Filtering by: <strong>{selectedCategory}</strong></span>}
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
          <div className="text-muted small mt-2">Loading catalogue...</div>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-5 surface-card my-4">
          <BookOpen size={48} className="text-muted mb-2" />
          <h5 className="text-dark">No books match your criteria</h5>
          <p className="text-muted small">Try searching with different terms or selecting another category.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setCurrentPage(1);
            }}
            className="btn btn-outline-custom btn-sm mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 mb-4">
            {books.map((book) => (
              <div key={book._id} className="col">
                <BookCard book={book} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="btn btn-outline-custom btn-sm"
              >
                &larr; Previous
              </button>
              <span className="small text-muted px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="btn btn-outline-custom btn-sm"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Books;
