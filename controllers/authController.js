const supabase = require('../config/supabase');

// وظيفة لإنشاء حساب جديد
const registerUser = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ message: 'Please provide email, password, and full name.' });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }
    
    const user = authData.user;
    if (!user) {
        return res.status(400).json({ message: "Registration successful, but user data not returned. Please verify your email." });
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: user.id, full_name: full_name, role: 'user' }]);

    if (profileError) {
        return res.status(500).json({ message: profileError.message });
    }

    res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// وظيفة لتسجيل الدخول
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    // --- الجزء المعدل يبدأ هنا ---
    // بعد تسجيل الدخول بنجاح، جلب الملف الشخصي للمستخدم
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      // حتى لو فشل جلب الملف الشخصي، لا يزال تسجيل الدخول ناجحاً
      // سنرسل بيانات المستخدم الأساسية فقط في هذه الحالة
      console.error("Could not fetch user profile on login:", profileError.message);
      return res.status(200).json({ 
        message: 'Logged in successfully (profile fetch failed)', 
        session: data.session, 
        user: data.user
      });
    }
    
    // دمج معلومات الملف الشخصي مع بيانات المستخدم
    const userWithProfile = { ...data.user, ...profile };
    
    res.status(200).json({ 
      message: 'Logged in successfully', 
      session: data.session, 
      user: userWithProfile // <-- إرسال المستخدم مع دوره واسمه الكامل
    });
    // --- الجزء المعدل ينتهي هنا ---

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
};