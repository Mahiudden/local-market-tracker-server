# Daily Price Tracker for Local Markets (কাঁচাবাজার) - Backend

## 📚 Project Description

English: This backend server powers the Daily Price Tracker app, handling APIs, authentication, database, payment, user and product management, and more.

## 🌐 Live API URL
[Backend API](https://your-backend-url.com)

## 🚀 Features
- JWT & Firebase Authentication
- Role-based access (Admin, Vendor, User)
- RESTful API for products, orders, users, ads, watchlist
- Stripe payment integration
- Product review & rating endpoints
- Admin moderation & analytics
- MongoDB (local, no cloud)
- CORS, dotenv, security middleware

## 🔐 Authentication Details
- **Admin Email:** `admin@example.com`
- **Admin Password:** `Admin123`

## 📁 Folder Structure
```
backend/
  ├── middleware/
  ├── models/
  │   ├── routes/
  ├── routes/
  ├── server.js
  ├── .env
  └── ...
```

## ⚙️ Technologies Used
- Node.js
- Express.js
- MongoDB (local)
- Firebase Admin SDK
- Stripe
- dotenv, cors

## 🧩 NPM Packages Used
- express
- mongoose
- firebase-admin
- stripe
- cors
- dotenv
- nodemon

## ⚠️ Environment Variables
Create a `.env` file in the root of `backend`:
```
MONGODB_URI=mongodb://localhost:27017/your-db
STRIPE_SECRET_KEY=your_stripe_secret_key

```

## 💡 Setup Instructions
```bash
# 1. Clone the repository
$ git clone https://github.com/your-username/your-repo.git
$ cd last assinment/backend

# 2. Install dependencies
$ npm install

# 3. Configure environment variables
#    (see the .env example above)

# 4. Run the backend
$ npm run dev
# or
$ node server.js
```

## 📸 Screenshots
<img width="1906" height="905" alt="image" src="https://github.com/user-attachments/assets/1e4d1366-8c58-49a9-9a07-2657c528a76d" />


## 🙏 Credits / Contributors
- [Your Name](https://github.com/Mahiudden)

