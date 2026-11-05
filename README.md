# 📚 BookNook Server API (Backend)

The official RESTful backend API for **BookNook**, a digital library management system. Built with Express.js and native MongoDB, it provides robust and secure interfaces for catalog management, inventory tracking, borrowing workflows, and JWT authentication.

- 🔌 **Live Backend API**: [https://b14-a8-cat-ron-backend.vercel.app](https://b14-a8-cat-ron-backend.vercel.app)
- 🌐 **Frontend App**: [https://b14-a8-cat-ron-frontend.vercel.app](https://b14-a8-cat-ron-frontend.vercel.app)
- 📂 **Frontend Repo**: [https://github.com/mahmudulhasanmaruf78/B14-A8-Cat_Ron-frontend](https://github.com/mahmudulhasanmaruf78/B14-A8-Cat_Ron-frontend)

---

## ✨ Features

- **📖 Book Catalog (CRUD)**:
  - `GET /books`: Fetch books with search query (`title`/`author`), category filtering (`Fiction`, `Science`, `History`, `Kids`, `Others`), sorting (`newest`, `oldest`, `copies-desc`, `copies-asc`), and user-specific email filtering.
  - `GET /books/:id`: Retrieve detailed book record by MongoDB ObjectId.
  - `POST /books`: Protected route to add new books with validation.
  - `PATCH /books/:id`: Protected route to update book details.
  - `DELETE /books/:id`: Protected route to remove a book.

- **🔄 Borrow & Return System**:
  - `POST /borrows`: Borrow a book with atomic stock management (decrements `totalCopies` by 1 using MongoDB `$inc`).
  - **Duplicate Borrow Prevention**: Rejects duplicate active borrow requests for the same book by the same user.
  - `GET /borrows`: Fetch the active borrowed books of the authenticated user.
  - `DELETE /borrows/:id`: Process book returns, atomically restoring available copies (`$inc: { totalCopies: 1 }`).

- **🔐 Token-Based Authorization**:
  - `POST /jwt`: Issues signed JSON Web Tokens for authenticated users.
  - `verifyToken` middleware validates Bearer tokens on all sensitive routes.

- **⚡ Serverless Optimized**:
  - Clean CommonJS architecture optimized for Vercel serverless execution with connection reuse and fast responses.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Runtime** | [Node.js](https://nodejs.org/) (v18+) |
| **Framework** | [Express.js](https://expressjs.com/) |
| **Database** | [MongoDB](https://www.mongodb.com/) (Native MongoDB Node.js Driver) |
| **Security & Auth** | [jsonwebtoken (JWT)](https://jwt.io/) & [cors](https://www.npmjs.com/package/cors) |
| **Environment** | [dotenv](https://www.npmjs.com/package/dotenv) |
| **Deployment** | [Vercel](https://vercel.com/) (`vercel.json`) |

---

## 📡 API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | Server health check and endpoints list |
| `POST` | `/jwt` | Public | Generate authorization JWT token |
| `GET` | `/books` | Public | Get all books (query: `search`, `category`, `sort`, `limit`, `email`) |
| `GET` | `/books/:id` | Public | Get single book by ID |
| `POST` | `/books` | **Protected** | Create a new book |
| `PATCH` | `/books/:id` | **Protected** | Update an existing book |
| `DELETE` | `/books/:id` | **Protected** | Delete a book |
| `POST` | `/borrows` | **Protected** | Borrow a book (decrements copies) |
| `GET` | `/borrows` | **Protected** | Get user's active borrowed books |
| `DELETE` | `/borrows/:id` | **Protected** | Return a borrowed book (restores copies) |

---

## ⚙️ Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
DB_NAME=booknook
CLIENT_URL=https://b14-a8-cat-ron-frontend.vercel.app
JWT_SECRET=your_jwt_secret_key
```

---

## 🚀 Running Locally

### 1. Prerequisites
- Node.js 18 or newer
- MongoDB Atlas cluster or local MongoDB instance

### 2. Installation
```bash
cd server
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
The server will start on [http://localhost:5000](http://localhost:5000).

### 4. Start Production Server
```bash
npm start
```
