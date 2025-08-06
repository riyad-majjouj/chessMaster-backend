// app.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors'); // 1. استيراد cors
// تحميل متغيرات البيئة
dotenv.config();

// الاتصال بقاعدة البيانات
connectDB();

const app = express();
app.use(cors());
// وسيط لتحليل جسم الطلبات كـ JSON
app.use(express.json());

// تحديد المسارات الرئيسية
app.get('/', (req, res) => {
  res.send('Auth API is running...');
});

// استخدام مسارات المصادقة
// الكود الصحيح
app.use('/auth', authRoutes);

// وسيط لمعالجة الأخطاء (مثال بسيط)
// يمكنك إضافة وسيط أكثر تفصيلاً هنا
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


module.exports = app; // تصدير التطبيق للاستخدام في server.js
