// ملف: controllers/uploadController.js
const supabase = require('../config/supabase');

// @desc    رفع فيديو درس جديد (للأدمن فقط)
// @route   POST /api/uploads/lesson-video
const uploadLessonVideo = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No video file uploaded.' });
    }

    try {
        const file = req.file;
        const fileExt = file.originalname.split('.').pop();
        // اسم فريد باستخدام timestamp و id عشوائي لمنع التصادم
        const fileName = `lesson-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // 1. رفع الملف إلى مخزن 'lesson-videos'
        const { error: uploadError } = await supabase.storage
            .from('lesson-videos')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false // لا نريد استبدال الملفات الموجودة
            });

        if (uploadError) throw uploadError;

        // 2. الحصول على الرابط العام (Public URL)
        const { data } = supabase.storage
            .from('lesson-videos')
            .getPublicUrl(filePath);

        // 3. إرجاع الرابط فقط
        res.status(200).json({
            message: 'Video uploaded successfully.',
            videoUrl: data.publicUrl
        });

    } catch (error) {
        res.status(500).json({ message: 'Error uploading video file', error: error.message });
    }
};

module.exports = {
    uploadLessonVideo
};