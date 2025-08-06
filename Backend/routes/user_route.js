const express = require('express');
const router = express.Router();
const multer = require('multer');
const { upload_datas, get_data } = require('../controllers/user_homepage.js');
const verifyToken = require('../middleware/authMiddleware');
// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'added_photos/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\s+/g, '_');
    cb(null, 'user_photo_' + timestamp + '_' + originalName);
  }
});
const upload = multer({ storage: storage });

// Attach middleware and handler together
router.post('/upload', verifyToken, upload.single('photo'), upload_datas);
router.post('/getdata', verifyToken, get_data);

module.exports = router;
