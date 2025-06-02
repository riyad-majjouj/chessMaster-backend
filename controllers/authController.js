// controllers/authController.js
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    تسجيل مستخدم جديد
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  const { username, email, password, isSubscribed } = req.body;

  try {
    // التحقق إذا كان المستخدم موجودًا بالفعل
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'المستخدم موجود بالفعل (البريد الإلكتروني أو اسم المستخدم)' });
    }

    // إنشاء مستخدم جديد
    user = new User({
      username,
      email,
      password,
      isSubscribed: isSubscribed === true || isSubscribed === 'true' ? true : false, // تحويل القيمة إلى boolean
    });

    await user.save();

    // إنشاء توكن وإرساله
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      isSubscribed: user.isSubscribed,
      token,
      message: 'تم تسجيل المستخدم بنجاح'
    });

  } catch (error) {
    console.error(error.message);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

// @desc    تسجيل دخول المستخدم
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // التحقق من وجود البريد الإلكتروني وكلمة المرور
    if (!email || !password) {
      return res.status(400).json({ message: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' });
    }

    // البحث عن المستخدم بالبريد الإلكتروني وإرجاع كلمة المرور
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'بيانات الاعتماد غير صحيحة (بريد إلكتروني)' });
    }

    // مقارنة كلمة المرور
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'بيانات الاعتماد غير صحيحة (كلمة مرور)' });
    }

    // إنشاء توكن وإرساله
    const token = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      isSubscribed: user.isSubscribed,
      token,
      message: 'تم تسجيل الدخول بنجاح'
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};


// مثال لدالة محمية (يمكنك إضافتها لاحقًا)
// @desc    الحصول على بيانات المستخدم الحالي
// @route   GET /api/auth/me
// @access  Private (تحتاج إلى توكن)
// exports.getMe = async (req, res) => {
//   // req.user يتم تعيينه بواسطة authMiddleware
//   const user = await User.findById(req.user.id).select('-password');
//   if (!user) {
//       return res.status(404).json({ message: 'المستخدم غير موجود' });
//   }
//   res.status(200).json(user);
// };