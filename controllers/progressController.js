const supabase = require('../config/supabase');

// @desc    تحديد درس كمكتمل أو غير مكتمل
// @route   POST /api/progress/lessons/:lessonId
const markLessonProgress = async (req, res) => {
    const { lessonId } = req.params;
    const userId = req.user.id;
    const { is_completed } = req.body; // نتوقع boolean: true or false

    if (typeof is_completed !== 'boolean') {
        return res.status(400).json({ message: 'is_completed field must be a boolean.' });
    }

    try {
        // نستخدم upsert: إذا كان السجل موجوداً، قم بتحديثه. إذا لم يكن موجوداً، قم بإنشائه.
        // هذا يمنع الأخطاء ويجعل الكود أبسط.
        const { data, error } = await supabase
            .from('progress')
            .upsert(
                { user_id: userId, lesson_id: lessonId, is_completed: is_completed },
                { onConflict: 'user_id,lesson_id' } // في حالة وجود سجل بنفس user_id و lesson_id، قم بالتحديث بدلاً من الإضافة
            )
            .select();
        
        if (error) throw error;
        
        res.status(200).json(data[0]);
    } catch (error) {
        // معالجة خطأ محتمل إذا كان المستخدم يحاول تعديل تقدم درس لا ينتمي لدورة مشترك بها
        if (error.code === '23503') { // Foreign key violation
             return res.status(403).json({ message: 'Cannot mark progress for a lesson you do not have access to.' });
        }
        res.status(500).json({ message: 'Error marking lesson progress', error: error.message });
    }
};

module.exports = { markLessonProgress };