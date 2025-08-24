const express = require('express');
const router = express.Router();
const { createCheckoutSession } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// هذا المسار محمي ويتطلب تسجيل الدخول
router.post('/create-checkout-session', protect, createCheckoutSession);

// لا حاجة لوجود مسار الويب هوك هنا لأنه يُعالج بشكل خاص في app.js
// سنقوم بتصدير الراوتر فقط

module.exports = router;