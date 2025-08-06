// /api/index.js

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('../config/db'); //  لاحظ تعديل المسار
const authRoutes = require('../routes/authRoutes'); //  لاحظ تعديل المسار
const cors = require('cors');

// تحميل متغيرات البيئة
// Vercel يتعامل مع متغيرات البيئة بشكل مباشر، لكن من الجيد إبقاء هذا للتشغيل المحلي
dotenv.config();

// الاتصال بقاعدة البيانات
connectDB();

const app = express();
app.use(cors());

// وسيط لتحليل جسم الطلبات كـ JSON
app.use(express.json());

// استخدام مسارات المصادقة
// Vercel سيعيد توجيه الطلبات التي تبدأ بـ /api/ تلقائيًا إلى هذا الملف
app.use('/auth', authRoutes); // يمكنك إزالة /api من هنا

// مسار رئيسي اختياري للتحقق
app.get('/', (req, res) => {
    res.send('Auth API is running from Vercel!');
});


// وسيط لمعالجة الأخطاء
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// الأهم: قم بتصدير تطبيق Express
module.exports = app;