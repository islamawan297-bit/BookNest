# 📄 BOOKHUB - UNIVERSITY PROJECT REPORT & TECHNICAL DOCUMENTATION

---

## 1. Project Title
**BookHub – Full-Stack Online Book Store Application**

---

## 2. Introduction
BookHub is an end-to-end, high-performance e-commerce web application developed specifically for a university web development assignment. It is built using core Web 2.0 web development standards: **HTML5, Vanilla CSS3, Vanilla JavaScript (ES6+), Node.js, Express.js, and SQLite database**. 

BookHub provides an elegant platform for book enthusiasts to discover, search, filter, view details of, and order books online. Concurrently, it offers administrative tools to manage the catalog, oversee customer orders, track registered users, and review incoming contact form feedback.

---

## 3. Objectives
- **Demonstrate Core Web Engineering Principles**: Build a multi-page full-stack application without relying on heavy frontend frameworks (such as React or Next.js), proving mastery over DOM manipulation, asynchronous fetch APIs, and standard CSS layout techniques.
- **Implement RESTful Architecture**: Design a clean, decoupled Express.js REST API with proper HTTP verbs (GET, POST, PUT, DELETE) and JSON messaging.
- **Ensure Database Persistence**: Architect a relational database model in SQLite3 with proper tables, primary keys, foreign key constraints, and seed data.
- **Incorporate Security Fundamentals**: Implement user authentication via HTTP-only sessions, password hashing using `bcryptjs`, and input sanitization to prevent SQL injection and XSS vulnerabilities.
- **Deliver Responsive UI/UX**: Craft a modern mobile-first interface featuring rich glassmorphism aesthetics, dark/light contrast elements, and instant visual feedback.

---

## 4. Problem Statement
Traditional physical bookstores often face limited reach, manual inventory management, and difficulties tracking customer preference data. Conversely, generic web templates often rely on heavy external frameworks that obscure core fundamental web concepts. 

**BookHub** solves this problem by providing a streamlined, lightweight, and completely functional online marketplace that demonstrates clear separation of concerns between frontend client interfaces, RESTful API endpoints, and a database storage engine.

---

## 5. Features

### 🌐 Public & Customer Features
- **Responsive Header Navigation**: Includes brand identity, quick page links, dynamic authentication state buttons, and a mobile hamburger menu drawer.
- **Homepage Showcase**: Hero banner, category highlights grid, and featured books carousel grid.
- **Books Catalog & Live Search**: Debounced real-time title/author search and instant category filter pills (*Tech & Science, Fiction, Non-Fiction, Fantasy, Business, Biography*).
- **Book Details View**: Dedicated detail page (`book-details.html`) showcasing synopsis, pricing, stock availability, star ratings, and an instant order form.
- **Quick Order Modal**: Modal dialog on catalog cards for rapid purchase without leaving the page.
- **Contact Form**: Interactive contact submission page saving feedback directly into the database with client-side validation.
- **User Authentication**: Secure user registration, password verification login, and session logout.
- **Protected User Dashboard**: Profile summary and real-time personal order history with order status indicators.

### 🛡️ Administrative Features
- **Protected Admin Panel**: Accessible exclusively by authenticated system administrators.
- **System Metrics**: Real-time summary stat cards for Total Books, Total Orders, Total Messages, and Registered Users.
- **Books Catalog CRUD**:
  - **Create**: Add new books with custom covers, pricing, categories, and stock numbers.
  - **Read**: View structured table of all inventory items.
  - **Update**: Edit book price, title, category, description, or stock.
  - **Delete**: Remove obsolete books with confirmation dialogs.
- **Orders Management**: Review customer shipping addresses, purchase quantities, total prices, and update order statuses (*Processing, Shipped, Completed, Cancelled*).
- **Registered Users Management**: View all customer accounts and remove inactive users.
- **Customer Messages Inbox**: Review feedback sent through the contact form and delete processed messages.

---

## 6. Technologies Used

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Structure** | HTML5 | Semantic elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`) |
| **Frontend Styling** | Vanilla CSS3 | Custom variables, Flexbox, Grid, glassmorphism, responsive media queries |
| **Frontend Logic** | Vanilla JS (ES6+) | Native DOM manipulation, Async/Await Fetch API, client validation |
| **Runtime Environment** | Node.js (v24+) | Server-side JavaScript execution environment |
| **Backend Framework** | Express.js (v4.21) | RESTful API routing, static file serving, middleware stack |
| **Database Engine** | SQLite3 | Zero-config relational file database with SQL constraints |
| **Password Hashing** | bcryptjs | Salted password hashing algorithm for credential security |
| **Session Engine** | express-session | HTTP-only session cookies (`connect.sid`) for stateful auth |
| **Environment Config** | dotenv | Isolation of sensitive port and session secret configurations |

---

## 7. System Architecture

BookHub follows a classic **3-Tier Architecture**:

```
+-------------------------------------------------------------------+
|                        PRESENTATION TIER                          |
|    HTML5 / CSS3 / Vanilla JavaScript (Desktop, Tablet, Mobile)   |
+---------------------------------+---------------------------------+
                                  |
                   HTTP / REST API (JSON Payload)
                                  |
+---------------------------------v---------------------------------+
|                          APPLICATION TIER                         |
|     Node.js + Express Server (Controllers, Routes, Middleware)    |
|       - Auth (bcrypt + express-session)                           |
|       - Books Controller (CRUD)                                   |
|       - Orders & Contact Controllers                              |
+---------------------------------+---------------------------------+
                                  |
                       SQLite3 Native Driver API
                                  |
+---------------------------------v---------------------------------+
|                           DATA TIER                               |
|        SQLite Relational File Database (bookhub.db)               |
|      - users | books | orders | messages tables                   |
+-------------------------------------------------------------------+
```

---

## 8. Database / ER Diagram

Below is the text-based Entity-Relationship (ER) diagram illustrating tables and foreign key relationships:

```
 +------------------------+              +------------------------+
 |        USERS           |              |         BOOKS          |
 +------------------------+              +------------------------+
 | PK  id        (INT)    |<--+      +---| PK  id        (INT)    |
 |     name      (TEXT)   |   |      |   |     title     (TEXT)   |
 |     email     (TEXT)   |   |      |   |     author    (TEXT)   |
 |     password  (TEXT)   |   |      |   |     category  (TEXT)   |
 |     role      (TEXT)   |   |      |   |     price     (REAL)   |
 |     created_at(DATE)   |   |      |   |     stock     (INT)    |
 +------------------------+   |      |   |     rating    (REAL)   |
                              |      |   |     cover_img (TEXT)   |
                              |      |   |     desc      (TEXT)   |
                              |      |   |     created_at(DATE)   |
                              |      |   +------------------------+
                              |      |
                              |      |
                     +--------+------+-------+
                     |        ORDERS         |
                     +-----------------------+
                     | PK  id         (INT)  |
                     | FK  user_id    (INT)  |
                     | FK  book_id    (INT)  |
                     |     quantity   (INT)  |
                     |     total_price(REAL) |
                     |     address    (TEXT) |
                     |     payment    (TEXT) |
                     |     status     (TEXT) |
                     |     created_at (DATE) |
                     +-----------------------+

 +------------------------+
 |       MESSAGES         |
 +------------------------+
 | PK  id        (INT)    |
 |     name      (TEXT)   |
 |     email     (TEXT)   |
 |     subject   (TEXT)   |
 |     message   (TEXT)   |
 |     status    (TEXT)   |
 |     created_at(DATE)   |
 +------------------------+
```

---

## 9. Frontend Description
The frontend interface is constructed cleanly using HTML5 and modular JavaScript files located in `frontend/js/`:
- **`main.js`**: Controls header session state detection (`/api/auth/me`), global logout triggers, alert rendering, mobile hamburger drawer toggles, and base API URL resolution (`API_BASE_URL`).
- **`auth.js`**: Validates registration/login inputs on the client side, displays inline error spans, and executes fetch POST requests.
- **`books.js`**: Performs debounced live title search, handles category filter tab switches, dynamically constructs HTML book cards, and opens quick order modals.
- **`contact.js`**: Validates contact form inputs and submits feedback messages to the server.
- **`user-dashboard.js`**: Fetches and renders logged-in user profile details and their specific purchase orders.
- **`admin-dashboard.js`**: Drives the tabbed admin control panel, rendering data tables for inventory management, customer order status dropdown updates, customer user management, and contact message reviews.

---

## 10. Backend Description
The backend service is structured modularly inside `backend/`:
- **`server.js`**: Entry point that loads environment variables, configures CORS and session cookies, mounts REST sub-routers, serves the static `frontend/` directory, handles API 404 responses, and catches unhandled exceptions.
- **`config/db.js`**: Creates the SQLite database connection and provides promisified async helpers (`getAsync`, `allAsync`, `runAsync`).
- **`middleware/auth.js`**: Exports `requireAuth` (ensures user session exists) and `requireAdmin` (ensures `user.role === 'admin'`).
- **`controllers/`**:
  - `authController.js`: Manages user registration, bcrypt password hashing, login verification, session destruction, user listing, and user deletion.
  - `bookController.js`: Manages reading books with SQL filters, adding books, editing book records, and deleting books.
  - `contactController.js`: Saves incoming contact submissions and provides admin retrieval/deletion endpoints.
  - `orderController.js`: Handles order placement, inventory deduction, user order fetching, and admin status updates.

---

## 11. Database Design
The SQLite database file `database/bookhub.db` is initialized using `database/schema.sql`:

1. **`users` Table**:
   - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
   - `name` (TEXT, NOT NULL)
   - `email` (TEXT, UNIQUE, NOT NULL)
   - `password` (TEXT, NOT NULL)
   - `role` (TEXT, DEFAULT 'user')
   - `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

2. **`books` Table**:
   - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
   - `title` (TEXT, NOT NULL)
   - `author` (TEXT, NOT NULL)
   - `category` (TEXT, NOT NULL)
   - `price` (REAL, NOT NULL)
   - `stock` (INTEGER, DEFAULT 10)
   - `rating` (REAL, DEFAULT 4.5)
   - `cover_image` (TEXT, NOT NULL)
   - `description` (TEXT, NOT NULL)
   - `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

3. **`messages` Table**:
   - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
   - `name` (TEXT, NOT NULL)
   - `email` (TEXT, NOT NULL)
   - `subject` (TEXT, NOT NULL)
   - `message` (TEXT, NOT NULL)
   - `status` (TEXT, DEFAULT 'unread')
   - `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

4. **`orders` Table**:
   - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
   - `user_id` (INTEGER, FOREIGN KEY -> users(id) ON DELETE CASCADE)
   - `book_id` (INTEGER, FOREIGN KEY -> books(id) ON DELETE CASCADE)
   - `quantity` (INTEGER, DEFAULT 1)
   - `total_price` (REAL, NOT NULL)
   - `shipping_address` (TEXT, NOT NULL)
   - `payment_method` (TEXT, DEFAULT 'Credit Card')
   - `status` (TEXT, DEFAULT 'Processing')
   - `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

---

## 12. CRUD Operations Summary

| Entity | Create (POST) | Read (GET) | Update (PUT) | Delete (DELETE) |
| :--- | :--- | :--- | :--- | :--- |
| **Books** | `POST /api/books` (Admin) | `GET /api/books` & `/:id` (Public) | `PUT /api/books/:id` (Admin) | `DELETE /api/books/:id` (Admin) |
| **Users** | `POST /api/auth/register` (Public) | `GET /api/auth/me` & `/users` | N/A | `DELETE /api/auth/users/:id` (Admin) |
| **Orders**| `POST /api/orders` (Protected) | `GET /api/orders/my-orders` & `/` | `PUT /api/orders/:id/status` (Admin) | N/A |
| **Messages**| `POST /api/contact` (Public) | `GET /api/contact` (Admin) | N/A | `DELETE /api/contact/:id` (Admin) |

---

## 13. Authentication Process
1. **Registration**: User submits name, email, and password. Server verifies email uniqueness, hashes password with `bcryptjs.hash(password, 10)`, saves user record to SQLite, and initializes session.
2. **Login**: User submits email and password. Server queries `users` by email, executes `bcryptjs.compare(password, user.password)`, and stores `{ id, name, email, role }` in `req.session.user`.
3. **Session Verification**: Frontend queries `/api/auth/me` on page load. If session exists, header dynamically displays user name and dashboard links.
4. **Logout**: User clicks logout. Frontend calls `POST /api/auth/logout`, destroying server session and clearing the `connect.sid` cookie.

---

## 14. Validation Implementation

### Client-Side Validation
- Real-time DOM checks for non-empty required fields.
- Email regex pattern matching (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
- Minimum password length checks (minimum 6 characters).
- Password and confirm password field equality comparison.
- Dynamic error message rendering directly under invalid form inputs.

### Server-Side Validation
- Validation in Express controllers prior to processing SQL logic.
- Sanitization and string trimming of all user inputs.
- Duplication check for email registrations (returns HTTP 409 Conflict).
- Stock level verification before order placement (returns HTTP 400 Bad Request if stock < quantity).
- Role checks ensuring non-admin users cannot access admin endpoints (returns HTTP 403 Forbidden).

---

## 15. Security Measures
- **Password Hashing**: Passwords stored as salted bcrypt hashes. Plaintext passwords are never logged or stored.
- **SQL Injection Prevention**: SQL Injection vulnerabilities are systematically mitigated across all database operations through the strict enforcement of SQLite prepared parameterized queries (`?` positional parameter placeholders), completely decoupling untrusted user input from SQL command structure.
- **Cross-Site Scripting (XSS) Mitigation**: All dynamic user-generated text rendered in HTML is sanitized using an `escapeHtml()` string replacement function.
- **HTTP-Only Cookies**: Session cookies set with `httpOnly: true` and `sameSite: 'lax'` to prevent client-side script theft.
- **Environment Isolation**: Sensitive configuration (`PORT`, `SESSION_SECRET`) loaded securely via `.env`.

---

## 16. Testing & Results

| Test Case | Description | Expected Outcome | Result |
| :--- | :--- | :--- | :--- |
| **TC-01** | User Registration | New user account inserted into DB & session started | **PASS** |
| **TC-02** | User Login | Validates password hash and returns session user | **PASS** |
| **TC-03** | Auth Protection | Unauthenticated GET `/api/auth/users` returns HTTP 403 | **PASS** |
| **TC-04** | Catalog Search | Debounced search filters books matching keyword | **PASS** |
| **TC-05** | Category Filter | Returns only books matching selected category | **PASS** |
| **TC-06** | Book Creation (Admin)| Adds new book item to SQLite `books` table | **PASS** |
| **TC-07** | Book Update (Admin)  | Modifies price/stock of existing book record | **PASS** |
| **TC-08** | Book Deletion (Admin)| Deletes book item from SQLite database | **PASS** |
| **TC-09** | Order Placement | Creates order record & deducts inventory stock | **PASS** |
| **TC-10** | Contact Submission | Saves message to SQLite `messages` table | **PASS** |
| **TC-11** | API 404 Route | Unmapped API route returns HTTP 404 JSON | **PASS** |

---

## 17. Limitations
- **Payment Processing**: Payment options are simulated (credit card selected without live payment gateway API integration like Stripe or PayPal).
- **Single File SQLite Storage**: SQLite is suitable for small to medium scale applications, but enterprise production scale may require PostgreSQL or MySQL.

---

## 18. Future Improvements
- **Payment Gateway Integration**: Integrate Stripe or PayPal sandbox for real credit card processing.
- **Image File Uploads**: Implement Multer middleware to allow admins to upload cover images directly instead of supplying image URLs.
- **Password Reset**: Implement email verification token generation for forgotten password resets.
- **Product Reviews & Ratings**: Allow registered customers to submit ratings and textual reviews for purchased books.

---

## 19. Conclusion
The **BookHub** application successfully demonstrates a complete, fully functional full-stack web software solution. By adhering strictly to core web development fundamentals (HTML5, Vanilla CSS3, Vanilla JavaScript, Node.js, Express, and SQLite), the application proves that robust e-commerce features, secure authentication, and CRUD database interactions can be implemented cleanly and efficiently without relying on heavy frontend frameworks.

---

## 20. References
1. MDN Web Docs: *HTML5, CSS3, and JavaScript Standard Reference*. https://developer.mozilla.org/
2. Express.js Documentation: *Fast, unopinionated, minimalist web framework for Node.js*. https://expressjs.com/
3. SQLite Documentation: *Self-contained, serverless, SQL database engine*. https://www.sqlite.org/
4. Node.js Documentation: *JavaScript Runtime Environment*. https://nodejs.org/
