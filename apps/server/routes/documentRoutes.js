const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { uploadDocument, getMyDocuments } = require('../controllers/DocumentController');
const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({ storage });

router.post('/upload', authMiddleware, upload.single('file'), uploadDocument);

router.get('/', authMiddleware, getMyDocuments);

module.exports = router;