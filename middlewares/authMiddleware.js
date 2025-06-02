// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // الحصول على التوكن من الهيدر
      token = req.headers.authorization.split(' ')[1];

      // التحقق من التوكن
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // الحصول على المستخدم من التوكن (بدون كلمة المرور)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'غير مصرح به، المستخدم غير موجود' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'غير مصرح به، التوكن فشل' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'غير مصرح به، لا يوجد توكن' });
  }
};