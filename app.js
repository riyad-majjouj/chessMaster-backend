// استيراد المكتبات الأساسية
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// تحميل متغيرات البيئة من ملف .env
dotenv.config();

// --- استيراد المتحكمات والمسارات ---
const { handleStripeWebhook } = require('./controllers/paymentController'); // <-- استيراد معالج الويب هوك مباشرة
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes'); 
const progressRoutes = require('./routes/progressRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // <-- الآن سيستورد الراوتر بشكل صحيح

// إنشاء تطبيق Express
const app = express();

// استخدام Middleware (وظائف وسيطة)
app.use(cors());

// --- معالجة الويب هوك أولاً ---
// هذا المسار يجب أن يكون قبل express.json() لأنه يحتاج للنص الخام
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// الآن يمكننا استخدام express.json() لبقية المسارات
app.use(express.json());

// --- استخدام المسارات (Routing) ---
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enroll', enrollmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);

// --- هذا هو السطر الذي تم إصلاحه ---
// الآن المتغير paymentRoutes يحتوي على الراوتر مباشرة
app.use('/api/payments', paymentRoutes); 

// مسار تجريبي للتأكد من أن الخادم يعمل
app.get('/', (req, res) => {
  res.send('مرحباً بك في الواجهة الخلفية لموقع دورات الشطرنج!');
});

// تحديد المنفذ (Port) الذي سيعمل عليه الخادم
const PORT = process.env.PORT || 5000;

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});