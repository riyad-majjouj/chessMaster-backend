// ملف: routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const { uploadLessonVideo } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware'); // سنقوم بتعديله قليلاً

router.post(
    '/lesson-video',
    protect,
    isAdmin,
    // upload.single('videoFile') سيستقبل ملفاً واحداً باسم 'videoFile'
    upload.single('videoFile'), 
    uploadLessonVideo
);

module.exports = router;