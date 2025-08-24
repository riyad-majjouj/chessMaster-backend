const express = require('express');
const router = express.Router();
const { 
    getDashboardStats,
    getAllUsers,
    getCoursesWithStats
} = require('../controllers/adminController');

const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// تطبيق middleware الحماية والأدمن على جميع المسارات في هذا الملف
router.use(protect, isAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/courses-stats', getCoursesWithStats);

module.exports = router;