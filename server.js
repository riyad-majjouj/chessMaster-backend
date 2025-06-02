// server.js
const app = require('./app'); // استيراد التطبيق من app.js

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);

// معالجة الأخطاء غير المعالجة في الـ Promises
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // إغلاق السيرفر والخروج
  server.close(() => process.exit(1));
});