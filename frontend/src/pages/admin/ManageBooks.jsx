import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, Search, CheckCircle, AlertCircle, Image } from 'lucide-react';
import api, { getCoverImageUrl } from '../../services/api';

const CATEGORIES = [
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

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookId, setCurrentBookId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Fiction',
    description: '',
    purchasePrice: '',
    rentalPricePerDay: '',
    totalStock: 10,
    availableStock: 10,
    coverImageUrl: '',
    isbn: '',
    publisher: 'Book Heaven Publishing',
    publishedYear: 2024,
    isFeatured: false
  });

  const [file, setFile] = useState(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/books?limit=100');
      if (res.data.success) {
        setBooks(res.data.books);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentBookId(null);
    setFormData({
      title: '',
      author: '',
      category: 'Fiction',
      description: '',
      purchasePrice: '',
      rentalPricePerDay: '',
      totalStock: 10,
      availableStock: 10,
      coverImageUrl: '',
      isbn: '',
      publisher: 'Book Heaven Publishing',
      publishedYear: 2024,
      isFeatured: false
    });
    setFile(null);
    setShowModal(true);
  };

  const openEditModal = (b) => {
    setIsEditing(true);
    setCurrentBookId(b._id);
    setFormData({
      title: b.title,
      author: b.author,
      category: b.category,
      description: b.description,
      purchasePrice: b.purchasePrice,
      rentalPricePerDay: b.rentalPricePerDay,
      totalStock: b.totalStock,
      availableStock: b.availableStock,
      coverImageUrl: b.coverImage?.startsWith('http') ? b.coverImage : '',
      isbn: b.isbn || '',
      publisher: b.publisher || 'Book Heaven Publishing',
      publishedYear: b.publishedYear || 2024,
      isFeatured: b.isFeatured || false
    });
    setFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });

      if (file) {
        payload.append('coverImage', file);
      }

      if (isEditing) {
        await api.put(`/books/${currentBookId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setFeedback({ type: 'success', text: 'Book updated successfully!' });
      } else {
        await api.post('/books', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setFeedback({ type: 'success', text: 'Book created and added to inventory!' });
      }

      setShowModal(false);
      fetchBooks();
    } catch (err) {
      setFeedback({ type: 'danger', text: err.response?.data?.message || 'Operation failed.' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" from inventory?`)) return;

    try {
      await api.delete(`/books/${id}`);
      setFeedback({ type: 'success', text: `"${title}" was removed.` });
      fetchBooks();
    } catch (err) {
      setFeedback({ type: 'danger', text: err.response?.data?.message || 'Delete failed.' });
    } finally {
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase())
  );

  const fallbackImage = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark brand-font mb-0">Inventory & Books Management</h2>
          <span className="text-muted small">Add, update prices, stock, and descriptions</span>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary-custom d-flex align-items-center gap-1">
          <Plus size={16} />
          <span>Add New Book</span>
        </button>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} py-2 mb-3 small`}>
          {feedback.text}
        </div>
      )}

      {/* Search Bar */}
      <div className="surface-card p-3 mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <Search size={18} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Search books by title, author, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Books Table */}
      <div className="surface-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="small text-muted">
                <th>Cover</th>
                <th>Title & Author</th>
                <th>Category</th>
                <th>Buy Price</th>
                <th>Rent/Day</th>
                <th>Available Stock</th>
                <th>Total Stock</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="small">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">Loading books...</td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">No books found in inventory.</td>
                </tr>
              ) : (
                filteredBooks.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <img
                        src={getCoverImageUrl(b.coverImage, fallbackImage)}
                        alt={b.title}
                        className="rounded border"
                        style={{ width: '42px', height: '56px', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = fallbackImage; }}
                      />
                    </td>
                    <td>
                      <strong className="text-dark d-block">{b.title}</strong>
                      <span className="text-muted">{b.author}</span>
                      {b.isFeatured && <span className="badge-featured ms-2">Featured</span>}
                    </td>
                    <td>
                      <span className="badge-category">{b.category}</span>
                    </td>
                    <td className="fw-bold text-success">₹{b.purchasePrice}</td>
                    <td className="fw-bold text-primary">₹{b.rentalPricePerDay}</td>
                    <td>
                      <span className={`badge ${b.availableStock > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                        {b.availableStock} copies
                      </span>
                    </td>
                    <td>{b.totalStock} copies</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          onClick={() => openEditModal(b)}
                          className="btn btn-outline-secondary"
                          title="Edit Book"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(b._id, b.title)}
                          className="btn btn-outline-danger"
                          title="Delete Book"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Book Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  {isEditing ? 'Edit Book Details' : 'Add New Book to Inventory'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label small fw-semibold text-secondary">Book Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-secondary">Category *</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Author *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-secondary">Purchase Price (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-secondary">Rental / Day (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={formData.rentalPricePerDay}
                        onChange={(e) => setFormData({ ...formData, rentalPricePerDay: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Total Stock</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={formData.totalStock}
                        onChange={(e) => setFormData({ ...formData, totalStock: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Available Stock</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={formData.availableStock}
                        onChange={(e) => setFormData({ ...formData, availableStock: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">Description *</label>
                      <textarea
                        rows="3"
                        className="form-control"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Cover Image URL (Optional)</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://..."
                        value={formData.coverImageUrl}
                        onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Or Upload File (JPEG/PNG/WebP)</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-secondary">ISBN</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.isbn}
                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-secondary">Publisher</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.publisher}
                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-secondary">Published Year</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.publishedYear}
                        onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="featuredCheck"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        />
                        <label className="form-check-label small" htmlFor="featuredCheck">
                          Feature this book on the Home page hero/showcase
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary-custom btn-sm">
                    {submitting ? 'Saving...' : isEditing ? 'Update Book' : 'Add Book to Inventory'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBooks;
