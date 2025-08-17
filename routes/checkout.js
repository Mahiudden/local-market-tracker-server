const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
// require('dotenv').config();
const fetch = require('node-fetch'); // রিয়েলটাইম রেট আনার জন্য
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken'); // ফায়ারবেস টোকেন ভেরিফাই করার জন্য

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
// console.log('Stripe Secret Key:', .STRIPE_SECRET_KEY); // ডিবাগিংয়ের জন্য

// Create Stripe Checkout Session
router.post('/create-checkout-session', verifyFirebaseToken, async (req, res) => {
  try {
    const { productName, price, productId, marketName, date, userUid } = req.body;
    if (!productName || !price || !productId) {
      return res.status(400).json({ message: 'Missing product info' });
    }
    // টাকা থেকে USD conversion
    let usdAmount = price;
    let rate = 0.0091;
    try {
      const fxRes = await fetch('https://api.exchangerate-api.com/v4/latest/BDT');
      const fxData = await fxRes.json();
      rate = fxData.rates['USD'] || 0.0091; // fallback rate
      usdAmount = (Number(price) * rate).toFixed(2);
    } catch {
      usdAmount = (Number(price) * 0.0091).toFixed(2); // fallback
    }

    // Stripe মিনিমাম এমাউন্ট চেক
    const minUsd = 0.5;
    const minBdt = Math.ceil(minUsd / rate);
    if (usdAmount < minUsd) {
      return res.status(400).json({ message: `প্রোডাক্টের দাম কমপক্ষে ${minBdt} (bdt) হতে হবে। দয়া করে বেশি এমাউন্ট দিন।` });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
            },
            unit_amount: Math.round(Number(usdAmount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/payment-cancel`,
      metadata: {
        productId,
        userUid: userUid || '',
        productName: productName || '',
        marketName: marketName || '',
        price: price,
        date: date || '',
      },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe Checkout Error:', err); // ডিবাগিংয়ের জন্য
    res.status(500).json({ message: 'Stripe error', error: err.message });
  }
});

// Get Stripe session details (for PaymentSuccess page)
router.get('/session-details', verifyFirebaseToken, async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ message: 'Missing session_id' });
    const session = await stripe.checkout.sessions.retrieve(session_id);
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch session details', error: err.message });
  }
});

module.exports = router; 