# 📚 BookHub – Full-Stack Online Book Store

---

## 📌 Project Title
**BookHub – Full-Stack Online Book Store Web Application**

---

## 📖 Introduction
BookHub is a complete e-commerce web platform developed for a university web development assignment using **HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, and SQLite database**. The project delivers a fully interactive experience for discovering, filtering, viewing, and purchasing books online, accompanied by a comprehensive administration panel for inventory management, customer order processing, user management, and contact inquiry handling.

---

## 🎯 Objectives
- Build a responsive, multi-page web application using fundamental web technologies without frontend frameworks (React/Next.js).
- Design and expose a structured REST API using Express.js.
- Store data persistently using an SQLite relational database with foreign key relationships.
- Implement secure authentication using HTTP-only session cookies and bcrypt password hashing.
- Provide dual user experiences: Customer Portal and Administrator Dashboard.

---

## ❓ Problem Statement
Many physical bookstores lack accessible online ordering channels, while generic web templates often obscure core software engineering concepts. BookHub solves this by providing a clean, accessible, and production-ready architecture demonstrating the complete flow from client UI interaction to database persistence.

---

## ✨ Features

### Customer Features
- **Home Page**: Hero banner, category highlights grid, and featured book showcase.
- **Catalog Page**: Real-time debounced title/author search, category filter pills (*Tech & Science, Fiction, Non-Fiction, Fantasy, Business, Biography*), and quick order modal.
- **Book Details**: Full book synopsis, price, rating, stock status, and purchase form.
- **About Us**: Project story, technical stack breakdown, and platform statistics.
- **Contact Us**: Form with client validation saving messages into the SQLite database.
- **Authentication**: Registration, login with password verification, and session logout.
- **User Dashboard**: Profile details and personal order history with live status indicators.

### Admin Features
- **Protected Admin Panel**: Accessible exclusively to authenticated admin role users.
- **System Metrics**: Live counters for Total Books, Total Orders, Total Messages, and Registered Users.
- **Books Catalog CRUD**: Add new books, edit existing inventory, delete books.
- **Orders Management**: View customer orders and update status (*Processing, Shipped, Completed, Cancelled*).
- **Users Management**: View all registered system users and remove inactive accounts.
- **Contact Inbox**: Review and delete customer contact form submissions.

---

## 🛠️ Technologies Used
- **Frontend**: HTML5, Vanilla CSS3 (Flexbox/Grid), Vanilla JavaScript (ES6+ Fetch API)
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Security**: bcryptjs (Password Hashing), express-session (Session Cookies), dotenv (Environment Configuration)

---

## 🏗️ System Architecture
BookHub utilizes a 3-Tier Web Architecture:
- **Presentation Tier**: HTML5, CSS3, Vanilla JS (Desktop & Mobile Responsive)
- **Application Tier**: Express.js REST API with authentication middleware
- **Data Tier**: SQLite3 database (`bookhub.db`) with relational tables

---

## 📁 Project Structure

```
BookNest/
├── backend/
│   ├── config/
│   │   └── db.js            # SQLite database connection & promisified helper functions
│   ├── controllers/
│   │   ├── authController.js    # Register, login, session auth, user management
│   │   ├── bookController.js    # Books CRUD API logic
│   │   ├── contactController.js # Contact form submissions & inbox management
│   │   └── orderController.js   # Order creation & status updates
│   ├── middleware/
│   │   └── auth.js          # requireAuth & requireAdmin protection middleware
│   ├── routes/
│   │   ├── authRoutes.js    # /api/auth endpoints
│   │   ├── bookRoutes.js    # /api/books endpoints
│   │   ├── contactRoutes.js # /api/contact endpoints
│   │   └── orderRoutes.js   # /api/orders endpoints
│   └── server.js            # Express application entry point
├── database/
│   ├── schema.sql           # Database table definitions
│   ├── seed.js              # Initial database seeder script
│   └── bookhub.db           # SQLite database storage file
├── frontend/
│   ├── css/
│   │   └── styles.css       # Master responsive CSS stylesheet
│   ├── js/
│   │   ├── main.js          # Navigation, session verification & alert banner utilities
│   │   ├── auth.js          # Register/login client-side validation
│   │   ├── books.js         # Books catalog, search, filter & modal handlers
│   │   ├── contact.js       # Contact form client-side validation
│   │   ├── user-dashboard.js# User profile & order history renderer
│   │   └── admin-dashboard.js# Admin panel CRUD table drivers
│   ├── index.html           # Home Page
│   ├── about.html           # About Page
│   ├── books.html           # Books Catalog Page
│   ├── book-details.html    # Book Details Page
│   ├── contact.html         # Contact Form Page
│   ├── register.html        # User Registration Page
│   ├── login.html           # Login Page
│   ├── user-dashboard.html  # Customer Dashboard
│   ├── admin-dashboard.html # Admin Dashboard
│   └── 404.html             # Page Not Found Error View
├── .env                     # Environment variables configuration
├── .env.example             # Environment variables template
├── package.json             # NPM dependencies & start scripts
├── PROJECT_REPORT.md        # Comprehensive University Project Report
└── README.md                # Project documentation
```

---

## 🗄️ Database Design & Tables

1. **`users`**: `id` (PK), `name`, `email` (UNIQUE), `password` (Hashed), `role`, `created_at`
2. **`books`**: `id` (PK), `title`, `author`, `category`, `price`, `stock`, `rating`, `cover_image`, `description`, `created_at`
3. **`messages`**: `id` (PK), `name`, `email`, `subject`, `message`, `status`, `created_at`
4. **`orders`**: `id` (PK), `user_id` (FK -> users), `book_id` (FK -> books), `quantity`, `total_price`, `shipping_address`, `status`, `created_at`

---

## 📡 API Endpoints

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register new user account |
| `/api/auth/login` | `POST` | Public | Login user & start session |
| `/api/auth/logout` | `POST` | Public | Destroy session & logout |
| `/api/auth/me` | `GET` | Public | Get current session user |
| `/api/auth/users` | `GET` | Admin | Fetch all registered users |
| `/api/auth/users/:id` | `DELETE` | Admin | Delete a user account |
| `/api/books` | `GET` | Public | Fetch books with search/filter |
| `/api/books/:id` | `GET` | Public | Fetch single book details |
| `/api/books` | `POST` | Admin | Create a new book item |
| `/api/books/:id` | `PUT` | Admin | Update an existing book |
| `/api/books/:id` | `DELETE` | Admin | Delete a book item |
| `/api/orders` | `POST` | User | Place a new order |
| `/api/orders/my-orders` | `GET` | User | Fetch user's order history |
| `/api/orders` | `GET` | Admin | Fetch all system orders |
| `/api/orders/:id/status`| `PUT` | Admin | Update order status |
| `/api/contact` | `POST` | Public | Submit contact message |
| `/api/contact` | `GET` | Admin | Fetch all contact messages |
| `/api/contact/:id` | `DELETE` | Admin | Delete a contact message |

---

## 🔒 Authentication Process
1. **Registration**: User registers; server hashes password with `bcryptjs` and inserts record into SQLite.
2. **Login**: Server compares supplied plaintext password with hashed password stored in SQLite. Upon match, `{ id, name, email, role }` is saved to `req.session.user`.
3. **Protected Access**: Requests to protected routes pass through `requireAuth` or `requireAdmin` middleware.

---

## 🔄 CRUD Operations Summary
- **Create**: Add books, place orders, submit contact messages, register accounts.
- **Read**: Browse catalog, view book details, inspect personal orders, fetch admin stats.
- **Update**: Edit book price/stock/title, change order delivery status.
- **Delete**: Remove books, delete users, delete contact messages.

---

## ✔️ Validation
- **Client-Side**: Form input validation, email pattern checking, password length verification, inline error message formatting.
- **Server-Side**: Input trimming, empty field checking, email duplication checks, stock availability verification, role authorization enforcement.

---

## 🛡️ Security Measures
- Passwords hashed using `bcryptjs` (salt rounds 10).
- SQL Injection vulnerabilities are systematically mitigated across all database operations through the strict enforcement of SQLite prepared parameterized queries (`?` positional parameter placeholders), completely decoupling untrusted user input from SQL command structure.
- XSS prevention through HTML string escaping.
- Session cookie protection (`httpOnly: true`, `sameSite: 'lax'`).
- Environment variable isolation (`dotenv`).

---

## 💻 Installation & Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Seed Database
```bash
npm run seed
```

### Step 3: Run the Application
```bash
npm start
```

### Step 4: Access in Browser
Open **`http://localhost:3000`** in your browser.

---

## 🔑 Admin & Test Credentials

| Account Type | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@bookhub.com` | `admin123` | Administrator (Full CRUD) |
| **Sample User** | `john@example.com` | `user123` | Customer |

---

## 🧪 Testing Results
All major functional areas (Registration, Login, Logout, Search, Filtering, Catalog, Book Details, Order Placement, Admin CRUD, User Management, Contact Messages, 404 Routing) were thoroughly tested and achieved a **100% PASS** result with zero console errors.

---

## ⚠️ Limitations
- Payment checkout is simulated (no live Stripe/PayPal API key connection required).
- Database uses single-file SQLite3 storage suitable for small-to-medium deployments.

---

## 🔮 Future Improvements
- Integrate Stripe API for live payment processing.
- Add file upload capabilities for book cover images using `multer`.
- Implement automated email receipts using `nodemailer`.

---

## 🏁 Conclusion
BookHub is a complete, fully functional, responsive full-stack e-commerce web application that demonstrates solid engineering principles, clean REST API design, robust security measures, and database integration.

---

## 📚 References
1. MDN Web Docs: *HTML5, CSS3, JavaScript Reference*. https://developer.mozilla.org/
2. Express.js: *Fast, unopinionated web framework for Node.js*. https://expressjs.com/
3. SQLite Engine Documentation: https://www.sqlite.org/
