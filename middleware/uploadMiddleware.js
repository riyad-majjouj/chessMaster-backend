// ملف: middleware/uploadMiddleware.js
const multer = require('multer');
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // قبول الصور والفيديوهات
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type! Only images and videos are allowed.'), false);
        }
    },
    // زيادة حد حجم الملف للفيديوهات (مثلاً 100 ميجابايت)
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

module.exports = upload;