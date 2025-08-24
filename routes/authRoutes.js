const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

// مسار لإنشاء حساب مستخدم جديد
router.post('/register', registerUser);

// مسار لتسجيل دخول المستخدم
router.post('/login', loginUser);

module.exports = router;