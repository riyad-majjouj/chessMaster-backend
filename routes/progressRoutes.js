const express = require('express');
const router = express.Router();
const { markLessonProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

// جميع المسارات هنا محمية
router.use(protect);

router.post('/lessons/:lessonId', markLessonProgress);

module.exports = router;