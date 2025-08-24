const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addLessonToCourse,
  uploadCourseCover,
} = require('../controllers/courseController');
const { createReview, getCourseReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');
// === المسارات العامة (Public Routes) ===
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.get('/:courseId/reviews', getCourseReviews);
// === المسارات المحمية (Admin Only Routes) ===
// لاستخدام هذه المسارات، يجب أن يكون المستخدم مسجل دخوله (protect) وأن يكون أدمن (isAdmin)
router.post('/', protect, isAdmin, createCourse);
router.post('/:courseId/lessons', protect, isAdmin, addLessonToCourse);
router.put('/:id', protect, isAdmin, updateCourse);
router.delete('/:id', protect, isAdmin, deleteCourse);
router.post('/:courseId/reviews', protect, createReview);

router.post(
    '/:courseId/upload-cover',
    protect,
    isAdmin,
    upload.single('coverImage'),
    uploadCourseCover
);

module.exports = router;