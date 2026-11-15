# BOOK HEAVEN — MERN Bookstore, Rental, Password Recovery & Delivery Management System

A production-grade, full-stack MERN academic web application for an online bookstore and book rental platform. Built with **100% pure JavaScript/JSX** (zero TypeScript), MongoDB persistence via Mongoose, Razorpay/COD payment integration, cryptographic password recovery, Google Books API external discovery, role-based access control, and a field delivery boy management system with return pickups.

---

## Table of Contents

1. [Architectural Overview](#architectural-overview)
2. [Pure JavaScript/JSX Policy](#pure-javascriptjsx-policy)
3. [Technology Stack](#technology-stack)
4. [Roles & Permissions](#roles--permissions)
5. [Key Feature Workflows](#key-feature-workflows)
   - [A. Password Recovery Workflow](#a-password-recovery-workflow)
   - [B. Purchase Delivery Lifecycle](#b-purchase-delivery-lifecycle)
   - [C. Rental Delivery & Return Pickup Lifecycle](#c-rental-delivery--return-pickup-lifecycle)
   - [D. Google Books API Integration (Section 5A)](#d-google-books-api-integration-section-5a)
   - [E. Inventory Consistency Strategy](#e-inventory-consistency-strategy)
6. [Beginner-Friendly Windows Setup Guide](#beginner-friendly-windows-setup-guide)
   - [1. Prerequisites Installation (Node.js, MongoDB, Compass)](#1-prerequisites-installation)
   - [2. Environment Configuration](#2-environment-configuration)
   - [3. Database Seeding](#3-database-seeding)
   - [4. Running Backend & Frontend](#4-running-backend--frontend)
   - [5. Running Automated Backend Tests](#5-running-automated-backend-tests)
   - [6. Exploring Collections in MongoDB Compass](#6-exploring-collections-in-mongodb-compass)
   - [7. Default Demo Accounts](#7-default-demo-accounts)
7. [API Endpoint Documentation](#api-endpoint-documentation)
8. [Troubleshooting Guide](#troubleshooting-guide)

---

## Architectural Overview

```
c:\Users\Lenovo\OneDrive\Desktop\Book Heaven FSD/
├── backend/
│   ├── config/              # MongoDB connection & system constants
│   ├── controllers/         # Request handling & business logic
│   ├── middleware/          # Role-based auth, rate limiting, multer upload, errors
│   ├── models/              # Mongoose schemas (User, Admin, DeliveryBoy, Book, Order, Rental, Delivery, Payment, Notification)
│   ├── routes/              # Express API route modules
│   ├── scripts/             # Database seeder (Admin, Delivery Boys, Books)
│   ├── tests/               # 28 Jest/Supertest integration test cases
│   ├── utils/               # Cryptographic tokens, Nodemailer service, HTML email templates
│   ├── uploads/books/       # Uploaded cover images storage
│   ├── server.js            # Express server entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, ProtectedRoute, DeliveryTimeline, BookCard, GoogleBookCard, NotificationBell
│   │   ├── context/         # AuthContext (multi-role) & CartContext (buy/rent)
│   │   ├── pages/           # Customer pages (Home, Books, BookDetails, GoogleBooks, Cart, Checkout, Orders, Rentals, Profile)
│   │   │   ├── admin/       # Administrator dashboard, books, orders, rentals, delivery boys, deliveries, payments
│   │   │   └── deliveryBoy/ # Delivery agent portal, active tasks, status progression, return pickups, profile
│   │   ├── services/        # Centralized Axios client & Google Books API client
│   │   ├── App.jsx          # Route definitions & guards
│   │   ├── main.jsx         # React DOM entry point
│   │   └── index.css        # Custom theme: cream/white backgrounds, deep navy, forest green accents
│   ├── index.html
│   ├── vite.config.js       # Vite configuration (pure JS)
│   ├── package.json
│   └── .env.example
├── README.md
└── .gitignore
```

---

## Pure JavaScript/JSX Policy

In strict accordance with project rules:
- **Zero TypeScript**: No `.ts`, `.tsx`, `.mts`, `.cts`, or `tsconfig.json` files exist in this repository.
- All React components and pages use `.jsx`.
- All backend files, frontend utilities, hooks, contexts, and configuration files use `.js`.

---

## Technology Stack

### Frontend
- **Framework:** React.js (v18) built with Vite (JS template)
- **Routing:** React Router DOM (v6)
- **HTTP Client:** Axios (centralized instance with JWT interceptors)
- **UI & Styling:** Bootstrap 5 with responsive CSS custom tokens (deep navy `#0f172a`, forest green `#15803d`, warm burgundy `#881337`)
- **Icons:** Lucide React
- **Payments:** Razorpay Checkout JS integration

### Backend
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB Community Server (port 27017) via Mongoose
- **Authentication:** JSON Web Tokens (JWT) with `authVersion` session invalidation
- **Password Hashing:** `bcryptjs`
- **Email Delivery:** Nodemailer with automated local development console fallback
- **File Uploads:** Multer with MIME validation and disk storage
- **Security:** Helmet, CORS allowlisting, and Express-Rate-Limit
- **Testing:** Jest and Supertest

---

## Roles & Permissions

| Role | Access URL | Capabilities & Restrictions |
| :--- | :--- | :--- |
| **Customer** | `/` | Browse local catalogue, explore Google Books, buy/rent books, checkout (COD / Razorpay), track orders, request return pickups, update profile. Blocked from admin and delivery boy portals. |
| **Administrator** | `/admin/login` | Full system oversight: CRUD books, view customer accounts, manage orders, schedule return pickups, confirm physical returns (restoring stock), create/deactivate delivery boys, assign deliveries, review payment audits. |
| **Delivery Boy** | `/delivery-boy/login` | View only assigned delivery tasks. Acknowledge pickup, mark out for delivery, mark delivered (with proof), mark failed (with mandatory reason), collect rental return pickups. Cannot edit prices, manage users, or restore stock. |

---

## Key Feature Workflows

### A. Password Recovery Workflow

1. User requests password reset at `/forgot-password` (for customer, administrator, or delivery boy).
2. Backend validates email and generates a cryptographically secure 32-byte random hex token.
3. The token is hashed via **SHA-256** and stored in MongoDB with a 15-minute expiration timestamp (`passwordResetExpires`).
4. An HTML email with a single-use reset link (`${APP_URL}/reset-password/${rawToken}`) is dispatched. If SMTP is unconfigured in development, the raw reset link is logged safely to the terminal console.
5. On the Reset Password page, the user enters and confirms a new password (min. 6 characters).
6. The backend hashes the incoming token, finds the valid unexpired record, updates the password using `bcryptjs`, and increments `authVersion`.
7. **Session Invalidation:** Incrementing `authVersion` immediately invalidates all previous JWT sessions across all devices.

### B. Purchase Delivery Lifecycle

1. Customer places order via COD or Razorpay test payment.
2. Order created with `orderStatus: 'Placed'`, and a `Delivery` record created with `type: 'Purchase'`, `status: 'PendingAssignment'`.
3. Administrator opens `/admin/deliveries` and assigns an **Active** delivery boy.
4. Delivery boy sees task in `/delivery-boy/my-deliveries`:
   - State transition: `Assigned` $\rightarrow$ `PickedUp` $\rightarrow$ `OutForDelivery` $\rightarrow$ `Delivered` or `Failed`.
5. Invalid transitions (e.g. jumping directly from `Assigned` to `Delivered`) are strictly rejected with HTTP 400.
6. When marked `Delivered`, Order status is updated to `Delivered` and COD payment is marked `Completed`.

### C. Rental Delivery & Return Pickup Lifecycle

1. Customer selects rental duration (7, 14, 21, 30 days) and places rental order.
2. Initial outbound delivery task is created and assigned to a delivery boy.
3. When the delivery boy delivers the book:
   - Rental status transitions to `Active`.
   - `startDate` is stamped to today; `dueDate` is set to `startDate + rentalDays`.
4. Prior to or on due date, customer requests return pickup or admin schedules return pickup via `/admin/rentals`.
5. A `RentalReturnPickup` delivery is assigned to a delivery boy who collects the book and marks it `Delivered` (field collected).
6. **Stock Restoration Safety:** The delivery boy marking collected updates rental status to `ReturnCollected` but **does not directly increment stock**.
7. Administrator inspects the physical book at the central warehouse and clicks **"Confirm Return"** in `/admin/rentals`.
8. Only then does the backend set `rental.stockRestored = true` and atomically restore available stock (`$inc: { availableStock: qty }`) **exactly once**.

### D. Google Books API Integration (Section 5A)

- Navigation section: **"Explore Google Books"** (`/explore-google-books`).
- Category exploration across 13 major genres: Fiction, Romance, Mystery, Fantasy, Science Fiction, History, Biography, Business, Technology, Education, Children, Comics, and Self-Help.
- Backend proxy endpoint `GET /api/google-books` sanitizes queries, maps categories to Google Books `subject:...` queries, and handles pagination (`startIndex`, `maxResults`).
- **Local Catalogue Match:** If a title discovered on Google Books matches a local Book Heaven in-stock title, a prominent **"Available on Book Heaven"** button appears, linking directly to our local checkout.
- Clear external badge and disclaimers distinguish discovery results from locally purchasable inventory.

### E. Inventory Consistency Strategy

To prevent overselling and race conditions without requiring a multi-document MongoDB replica set, Book Heaven utilizes **atomic conditional updates**:
```javascript
const book = await Book.findOneAndUpdate(
  { _id: bookId, availableStock: { $gte: quantity } },
  { $inc: { availableStock: -quantity } },
  { new: true }
);
```
If concurrent requests exceed stock, only requests meeting `{ availableStock: { $gte: quantity } }` succeed; all others are rejected immediately.

---

## Beginner-Friendly Windows Setup Guide

### 1. Prerequisites Installation

1. **Install Node.js (v18+ or v20+):**
   - Download the LTS installer from [nodejs.org](https://nodejs.org/) and run the installer.
   - Verify in PowerShell:
     ```powershell
     node -v
     npm -v
     ```

2. **Install MongoDB Community Server & Compass:**
   - Download MongoDB Community Server from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
   - Ensure "Install MongoDB as a Service" is checked.
   - Download **MongoDB Compass** for visual database inspection.
   - Verify MongoDB service is running in PowerShell:
     ```powershell
     Get-Service MongoDB
     ```

### 2. Environment Configuration

1. **Backend Environment:**
   In `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/bookheaven
   JWT_SECRET=super_secret_jwt_key_bookheaven_academic_project_2026
   CLIENT_URL=http://localhost:5173
   APP_URL=http://localhost:5173

   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=
   SMTP_PASS=
   EMAIL_FROM=Book Heaven <no-reply@bookheaven.local>

   RAZORPAY_KEY_ID=
   RAZORPAY_KEY_SECRET=
   RAZORPAY_WEBHOOK_SECRET=

   ADMIN_NAME=Book Heaven Admin
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=Admin@123456
   ```

2. **Frontend Environment:**
   In `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### 3. Database Seeding

Open a PowerShell terminal, navigate to the `backend` folder, and run the seeder:
```powershell
cd backend
node scripts/seed.js
```
*Output: Seeds the default Admin, 3 active Delivery Boys, 1 Customer, and 12 books across multiple categories into the `bookheaven` database.*

### 4. Running Backend & Frontend

Open **two separate PowerShell terminal windows**:

**Terminal 1 (Backend):**
```powershell
cd backend
npm run dev
```
*Backend runs on `http://localhost:5000`.*

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

Open your web browser and navigate to `http://localhost:5173`.

### 5. Running Automated Backend Tests

The project includes 28 automated integration tests covering security, password recovery, delivery state machines, and inventory consistency.
In PowerShell:
```powershell
cd backend
npm test
```
*All 28 tests will execute in an isolated test database (`bookheaven_test`).*

### 6. Exploring Collections in MongoDB Compass

1. Open **MongoDB Compass**.
2. Connect to: `mongodb://127.0.0.1:27017`.
3. Click on the `bookheaven` database.
4. Inspect the collections:
   - `users`: Registered customers
   - `admins`: System administrators
   - `deliveryboys`: Delivery personnel accounts
   - `books`: In-house inventory books
   - `orders`: Purchase orders with delivery linkages
   - `rentals`: Active and completed book rentals
   - `deliveries`: Full field dispatch and tracking records
   - `payments`: Transaction records (COD & Razorpay)
   - `notifications`: Real-time in-app alerts

### 7. Default Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `Admin@123456` |
| **Delivery Boy 1** | `rajesh@bookheaven.com` | `Delivery@123` |
| **Delivery Boy 2** | `amit@bookheaven.com` | `Delivery@123` |
| **Delivery Boy 3** | `vikram@bookheaven.com` | `Delivery@123` |
| **Customer** | `customer@example.com` | `Customer@123` |

---

## API Endpoint Documentation

### Authentication (`/api/auth`)
- `POST /register`: Register new customer account
- `POST /login`: Log in customer
- `POST /logout`: Log out customer
- `GET /me`: Get authenticated profile
- `PUT /profile`: Update name, phone, addresses
- `PUT /change-password`: Update password and increment authVersion
- `POST /forgot-password`: Request 15-minute reset token
- `POST /reset-password/:token`: Establish new password and invalidate previous sessions

### Administrator (`/api/admin`)
- `POST /login`: Admin authentication
- `POST /forgot-password`: Admin password reset request
- `POST /reset-password/:token`: Admin password reset
- `GET /dashboard`: Aggregate KPIs and recent activity
- `GET /users`: List registered customers

### Delivery Personnel (`/api/delivery-boy`)
- `POST /login`: Delivery boy authentication
- `POST /forgot-password`: Password reset request
- `POST /reset-password/:token`: Establish new password
- `GET /me`: Authenticated profile
- `PUT /profile`: Update vehicle and phone details

### Books (`/api/books`)
- `GET /`: Search, filter by category, sort, and paginate books
- `GET /:id`: Book details
- `POST /`: (Admin) Create book with cover upload
- `PUT /:id`: (Admin) Update book details
- `DELETE /:id`: (Admin) Remove book from catalogue

### External Google Books (`/api/google-books`)
- `GET /`: Proxy to Google Books API with category mapping, keyword search, and pagination

### Cart (`/api/cart`)
- `GET /`: View cart items
- `POST /`: Add purchase or rental item to cart
- `PUT /:id`: Update item quantity or rental duration
- `DELETE /:id`: Remove single item
- `DELETE /`: Clear cart

### Orders & Rentals (`/api/orders`, `/api/rentals`)
- `POST /orders`: Place purchase order with atomic stock reservation
- `GET /orders/my-orders`: Customer purchase history
- `GET /orders/:id`: Purchase order details with delivery tracking
- `GET /orders/admin/all`: (Admin) All purchase orders
- `PATCH /orders/admin/:id/status`: (Admin) Update order fulfillment status
- `POST /rentals`: Rent book with atomic stock reservation
- `GET /rentals/my-rentals`: Customer rental history
- `GET /rentals/:id`: Rental details with due dates
- `POST /rentals/:id/request-return`: Customer requests return pickup
- `GET /rentals/admin/all`: (Admin) All rentals
- `POST /rentals/admin/:id/schedule-pickup`: (Admin) Dispatch return collection
- `PATCH /rentals/admin/:id/return`: (Admin) Confirm physical return and restore stock

### Delivery Management (`/api/deliveries`)
- `GET /:id`: Shared delivery audit lookup
- `GET /admin/all`: (Admin) All deliveries with filter by type/status
- `POST /admin/:id/assign`: (Admin) Assign active delivery boy
- `PATCH /admin/:id/reassign`: (Admin) Reassign delivery task
- `GET /delivery-boy/active`: (Delivery Boy) Assigned active tasks
- `PATCH /delivery-boy/:id/status`: (Delivery Boy) Progress status with state validation
- `GET /delivery-boy/history`: (Delivery Boy) Completed tasks
- `GET /delivery-boy/return-pickups`: (Delivery Boy) Assigned rental return pickups

### Payments & Notifications (`/api/payments`, `/api/notifications`)
- `POST /payments/create-order`: Razorpay order creation
- `POST /payments/verify`: Verify HMAC SHA-256 signature
- `POST /payments/webhook`: Idempotent webhook capture
- `GET /payments/admin/all`: (Admin) Financial audit log
- `GET /notifications`: Get user notifications
- `PATCH /notifications/:id/read`: Mark notification as read
- `PATCH /notifications/read-all`: Mark all notifications as read

### System Health
- `GET /api/health`: Uptime and system health check

---

## Troubleshooting Guide

1. **MongoDB Connection Refused (`ECONNREFUSED 127.0.0.1:27017`):**
   - Ensure the MongoDB service is running in Windows Services:
     ```powershell
     Start-Service MongoDB
     ```
2. **Password Reset Token In Development:**
   - When testing locally without SMTP configured, the application safely displays the full single-use reset URL directly in the backend terminal console.
3. **Razorpay Key Missing:**
   - In development mode without Razorpay credentials, select **Cash on Delivery (COD)** on the checkout page. The application will fulfill the entire order and delivery lifecycle seamlessly.
