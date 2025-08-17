# Daily Price Tracker for Local Markets (কাঁচাবাজার) - Backend

## 📚 Project Description
বাংলা: এই ব্যাকএন্ড সার্ভারটি কাঁচাবাজার অ্যাপের জন্য API, অথেন্টিকেশন, ডাটাবেস, পেমেন্ট, ইউজার ও প্রোডাক্ট ম্যানেজমেন্ট ইত্যাদি পরিচালনা করে।

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
<!-- Add images here -->

## 🙏 Credits / Contributors
- [Your Name](https://github.com/your-username)
- [See contributors](https://github.com/your-username/your-repo/graphs/contributors)

## 📄 License
MIT 
