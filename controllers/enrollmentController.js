const supabase = require('../config/supabase');

// @desc    تسجيل المستخدم الحالي في دورة (سيتم استدعاؤه بعد الدفع)
// @route   POST /api/enroll/:courseId
const enrollInCourse = async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user.id; // نحصل عليه من middleware 'protect'

    try {
        // التحقق من أن المستخدم غير مشترك بالفعل
        const { data: existingEnrollment } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .maybeSingle();
        
        if (existingEnrollment) {
            return res.status(400).json({ message: 'User already enrolled in this course' });
        }

        // إنشاء اشتراك جديد
        const { data, error } = await supabase
            .from('enrollments')
            .insert([{ user_id: userId, course_id: courseId }])
            .select();

        if (error) throw error;

        res.status(201).json({ message: 'Successfully enrolled in the course', enrollment: data[0] });
    } catch (error) {
        res.status(500).json({ message: 'Error enrolling in course', error: error.message });
    }
};

// @desc    جلب جميع الدورات التي اشترك بها المستخدم الحالي
// @route   GET /api/enroll/my-courses
const getMyCourses = async (req, res) => {
    const userId = req.user.id;
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .select(`
                courses (
                    id,
                    title,
                    description,
                    cover_image_url
                )
            `)
            .eq('user_id', userId);

        if (error) throw error;
        
        // Supabase ترجع البيانات بشكل متداخل، نقوم بتبسيطها
        const myCourses = data.map(item => item.courses);
        res.status(200).json(myCourses);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching user courses', error: error.message });
    }
};

module.exports = { enrollInCourse, getMyCourses };