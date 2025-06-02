// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'اسم المستخدم مطلوب'],
    unique: true,
    trim: true,
    minlength: [3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'],
  },
  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'الرجاء إدخال بريد إلكتروني صالح'],
  },
  password: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة'],
    minlength: [6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'],
    select: false, // لا يتم إرجاع كلمة المرور افتراضيًا عند الاستعلام
  },
  isSubscribed: {
    type: Boolean,
    default: false, // القيمة الافتراضية هي غير مشترك
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function (next) {
  // تشفير كلمة المرور فقط إذا تم تعديلها (أو كانت جديدة)
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// دالة لمقارنة كلمة المرور المدخلة مع كلمة المرور المشفرة في قاعدة البيانات
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;