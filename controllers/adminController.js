const supabase = require('../config/supabase');
const supabaseAdmin = require('../config/supabaseAdmin');
// @desc    جلب إحصائيات عامة للموقع
// @route   GET /api/admin/stats
const getDashboardStats = async (req, res) => {
    try {
        // 1. جلب عدد المستخدمين
        const { count: userCount, error: userError } = await supabaseAdmin // <-- تم التصحيح
            .from('profiles')
            .select('*', { count: 'exact', head: true });
        if (userError) throw userError;

        // 2. جلب عدد الدورات
        const { count: courseCount, error: courseError } = await supabaseAdmin // <-- تم التصحيح
            .from('courses')
            .select('*', { count: 'exact', head: true });
        if (courseError) throw courseError;

        // 3. جلب عدد الاشتراكات
        const { data: enrollmentCount, error: enrollmentError } = await supabaseAdmin // <-- تم التصحيح
            .rpc('get_total_enrollments_count');
        if (enrollmentError) throw enrollmentError;

        res.status(200).json({
            users: userCount,
            courses: courseCount,
            enrollments: enrollmentCount
        });

    } catch (error) {
        // سنضيف تفاصيل أكثر للخطأ للمساعدة في التصحيح
        res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message || 'An unknown error occurred' });
    }
};

// @desc    جلب قائمة بجميع المستخدمين
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin.rpc('get_all_users_with_details'); // <-- تم التصحيح
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// @desc    جلب الدورات مع عدد المشتركين في كل دورة
// @route   GET /api/admin/courses-stats
const getCoursesWithStats = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin.rpc('get_courses_with_enrollment_count'); // <-- تم التصحيح
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course stats', error: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    getCoursesWithStats
};