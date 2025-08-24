const supabase = require('../config/supabase');

// @desc    إنشاء دورة جديدة (للأدمن فقط)
// @route   POST /api/courses
const createCourse = async (req, res) => {
  const { title, description, price } = req.body;
  
  if (!title || !description || !price) {
    return res.status(400).json({ message: 'Please provide title, description, and price' });
  }

  try {
    const { data, error } = await supabase
      .from('courses')
      .insert([{ title, description, price }])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creating course', error: error.message });
  }
};

// @desc    جلب جميع الدورات (عام للجميع)
// @route   GET /api/courses
const getAllCourses = async (req, res) => {
  try {
    const { data, error } = await supabase.from('courses').select('*');
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};
const addLessonToCourse = async (req, res) => {
    const { courseId } = req.params;
    const { title, video_url, order } = req.body;

    if (!title || !video_url || order === undefined) {
        return res.status(400).json({ message: 'Please provide title, video_url, and order' });
    }

    try {
        const { data, error } = await supabase
            .from('lessons')
            .insert([{ title, video_url, order, course_id: courseId }])
            .select();
        
        if (error) throw error;

        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error adding lesson', error: error.message });
    }
};

const getCourseById = async (req, res) => {
    const { id } = req.params;
    let user = null;

    // جلب المستخدم (إن وجد)
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        const { data } = await supabase.auth.getUser(token);
        user = data.user;
    }

    try {
        // 1. جلب بيانات الدورة الأساسية
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', id)
            .single();
        
        if (courseError || !course) return res.status(404).json({ message: 'Course not found' });
        
        // 2. جلب التقييمات المتعلقة بالدورة + بيانات أصحابها
        const { data: reviews, error: reviewsError } = await supabase
            .from('reviews')
            .select(`*, profiles(full_name)`)
            .eq('course_id', id);

        if (reviewsError) throw reviewsError;
        
        // 3. التحقق من الاشتراك وجلب الدروس مع التقدم (إذا كان مشتركاً)
        let isEnrolled = false;
        let lessonsWithProgress = [];

        if (user) {
            const { data: enrollment } = await supabase.from('enrollments').select('id').eq('user_id', user.id).eq('course_id', id).maybeSingle();
            isEnrolled = !!enrollment;

            if (isEnrolled) {
                const { data: lessonsData, error: lessonsError } = await supabase
                    .from('lessons')
                    .select(`*, progress(is_completed)`) // جلب الدروس مع التقدم
                    .eq('course_id', id)
                    .eq('progress.user_id', user.id);
                
                if (lessonsError) throw lessonsError;
                
                // تبسيط البيانات للفرونت اند
                lessonsWithProgress = lessonsData.map(lesson => ({
                    ...lesson,
                    is_completed: lesson.progress.length > 0 ? lesson.progress[0].is_completed : false,
                }));
            }
        }
        
        // 4. تجميع كل البيانات في استجابة واحدة
        const responseData = {
            ...course,
            isEnrolled,
            lessons: lessonsWithProgress.length > 0 ? lessonsWithProgress : (course.lessons || []), // أرجع الدروس مع التقدم إذا كان مشتركاً
            reviews: reviews || []
        };
        
        res.status(200).json(responseData);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching course details', error: error.message });
    }
};

// قم بتصدير الوظائف الجديدة مع القديمة


// @desc    تحديث دورة (للأدمن فقط)
// @route   PUT /api/courses/:id
const updateCourse = async (req, res) => {
    const { id } = req.params;
    const { title, description, price } = req.body;

    try {
        const { data, error } = await supabase
            .from('courses')
            .update({ title, description, price })
            .eq('id', id)
            .select();

        if (error) throw error;
        if (data.length === 0) return res.status(404).json({ message: 'Course not found' });

        res.status(200).json(data[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating course', error: error.message });
    }
};

// @desc    حذف دورة (للأدمن فقط)
// @route   DELETE /api/courses/:id
const deleteCourse = async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (error) throw error;

        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting course', error: error.message });
    }
};
const uploadCourseCover = async (req, res) => {
    const { courseId } = req.params;

    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded.' });
    }

    try {
        const file = req.file;
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${courseId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // 1. عملية الرفع (تبقى كما هي)
        const { error: uploadError } = await supabase.storage
            .from('course-covers')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (uploadError) throw uploadError;

        // --- الجزء المعدل يبدأ هنا ---
        
        // 2. بناء الرابط العام يدوياً بالطريقة الصحيحة
        // هذا يضمن عدم إضافة كلمة 'public' الخاطئة
        const supabaseUrl = process.env.SUPABASE_URL;
        const bucketName = 'course-covers';
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
        
        // --- نهاية الجزء المعدل ---


        // 3. عملية تحديث قاعدة البيانات (تبقى كما هي)
        const { data: updatedCourse, error: updateError } = await supabase
            .from('courses')
            .update({ cover_image_url: publicUrl })
            .eq('id', courseId)
            .select()
            .single();
        
        if (updateError) throw updateError;
        
        res.status(200).json({ 
            message: 'Cover image uploaded successfully.', 
            course: updatedCourse 
        });

    } catch (error) {
        res.status(500).json({ message: 'Error uploading cover image', error: error.message });
    }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById, // تأكد من استبدال الوظيفة القديمة بهذه
  updateCourse,
  deleteCourse,
  addLessonToCourse,
  uploadCourseCover, // <-- الجديدة
};