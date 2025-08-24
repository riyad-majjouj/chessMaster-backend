const express = require('express');
const router = express.Router();
const { enrollInCourse, getMyCourses } = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');

// جميع هذه المسارات محمية وتتطلب تسجيل الدخول
router.use(protect);

router.post('/:courseId', enrollInCourse);
router.get('/my-courses', getMyCourses);

module.exports = router;