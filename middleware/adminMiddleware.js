// استورد عميل الأدمن الجديد
const supabaseAdmin = require('../config/supabaseAdmin');

const isAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    // استخدم عميل الأدمن (الذي يتجاوز RLS) لجلب معلومات المستخدم
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    if (profile.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while checking admin role.' });
  }
};

module.exports = { isAdmin };