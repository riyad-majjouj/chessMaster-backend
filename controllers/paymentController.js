const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../config/supabase'); // <-- هذا يبقى كما هو لجلب بيانات الدورة
const supabaseAdmin = require('../config/supabaseAdmin'); // <-- استيراد العميل القوي الجديد

// دالة مساعدة لإنشاء الاشتراك في قاعدة بياناتنا
const createEnrollment = async (userId, courseId) => {
    // --- الجزء المعدل ---
    // استخدم العميل ذو الصلاحيات الكاملة لتجاوز RLS
    const { error } = await supabaseAdmin
        .from('enrollments')
        .insert({ user_id: userId, course_id: courseId });
    // --- نهاية التعديل ---

    if (error) {
        console.error('Supabase enrollment error:', error);
        throw error;
    }
};

// @desc    إنشاء جلسة دفع Stripe
// @route   POST /api/payments/create-checkout-session
const createCheckoutSession = async (req, res) => {
    // لا تغيير هنا، كل شيء يبقى كما هو
    const { courseId } = req.body;
    const userId = req.user.id;
    try {
        const { data: course, error } = await supabase.from('courses').select('title, price').eq('id', courseId).single();
        if (error || !course) {
            return res.status(404).json({ message: 'Course not found.' });
        }
        const session = await stripe.checkout.sessions.create({
            // ... (بقية إعدادات الجلسة تبقى كما هي)
             payment_method_types: ['card'],
             mode: 'payment',
             line_items: [{
                 price_data: {
                     currency: 'usd',
                     product_data: { name: course.title },
                     unit_amount: course.price * 100, 
                 },
                 quantity: 1,
             }],
             metadata: { userId, courseId },
             customer_email: req.user.email,
             success_url: `${process.env.FRONTEND_URL}/learn/${courseId}?payment=success`,
             cancel_url: `${process.env.FRONTEND_URL}/courses/${courseId}?payment=cancelled`,
        });
        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe session error:', error);
        res.status(500).json({ message: 'Failed to create payment session.' });
    }
};

// @desc    معالجة إشعارات الويب هوك من Stripe
// @route   POST /api/payments/webhook
const handleStripeWebhook = async (req, res) => {
     // لا تغيير هنا أيضاً، كل شيء يبقى كما هو
     const sig = req.headers['stripe-signature'];
     const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
     let event;
     try {
         event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
     } catch (err) {
         console.log(`Webhook signature verification failed.`, err.message);
         return res.status(400).send(`Webhook Error: ${err.message}`);
     }
     if (event.type === 'checkout.session.completed') {
         const session = event.data.object;
         const { userId, courseId } = session.metadata;
         console.log(`Payment successful for user ${userId} on course ${courseId}`);
         try {
             await createEnrollment(userId, courseId);
             console.log('Enrollment successful in database.');
         } catch (dbError) {
             console.error('Failed to create enrollment after payment:', dbError);
         }
     }
     res.status(200).json({ received: true });
};

module.exports = { createCheckoutSession, handleStripeWebhook };