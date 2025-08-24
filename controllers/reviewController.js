const supabase = require('../config/supabase');

// @desc    إضافة تقييم جديد لدورة (للمشتركين فقط)
// @route   POST /api/courses/:courseId/reviews
const createReview = async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user.id; // من middleware 'protect'
    const { rating, comment } = req.body;

    // التحقق من المدخلات
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Please provide a rating between 1 and 5.' });
    }

    try {
        const { data, error } = await supabase
            .from('reviews')
            .insert({
                user_id: userId,
                course_id: courseId,
                rating: rating,
                comment: comment
            })
            .select()
            .single(); // نتوقع إضافة سجل واحد فقط

        if (error) {
            // معالجة الأخطاء الشائعة من قاعدة البيانات
            if (error.code === '23505') { // Unique constraint violation
                return res.status(409).json({ message: 'You have already reviewed this course.' });
            }
            if (error.code === '23503') { // Foreign key violation
                 return res.status(403).json({ message: 'You must be enrolled in the course to review it.' });
            }
            throw error;
        }

        res.status(201).json(data);

    } catch (error) {
        res.status(500).json({ message: 'Error creating review', error: error.message });
    }
};

// @desc    جلب جميع التقييمات لدورة معينة (عام للجميع)
// @route   GET /api/courses/:courseId/reviews
const getCourseReviews = async (req, res) => {
    const { courseId } = req.params;

    try {
        // سنقوم بجلب التقييمات مع اسم المستخدم من جدول 'profiles'
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                id,
                created_at,
                rating,
                comment,
                profiles ( full_name ) 
            `)
            .eq('course_id', courseId)
            .order('created_at', { ascending: false }); // عرض الأحدث أولاً

        if (error) throw error;
        
        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
};

module.exports = {
    createReview,
    getCourseReviews
};