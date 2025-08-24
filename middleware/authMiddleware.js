const supabase = require('../config/supabase');

const protect = async (req, res, next) => {
  // 1. استخلاص التوكن من الهيدر (Header)
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // 2. التحقق من صحة التوكن باستخدام Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }

    // 3. إرفاق معلومات المستخدم بالطلب (req) لتكون متاحة في الوظائف التالية
    req.user = user;
    
    // 4. الانتقال إلى الوظيفة التالية في السلسلة
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };