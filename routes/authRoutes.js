// routes/authRoutes.js

const express = require('express');
const { registerUser, loginUser /*, getMe*/ } = require('../controllers/authController');
// const { protect } = require('../middlewares/authMiddleware'); // إذا أردت استخدام getMe

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
// router.get('/me', protect, getMe); // مثال لمسار محمي

module.exports = router;