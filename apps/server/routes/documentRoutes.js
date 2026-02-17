const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { uploadDocument, getMyDocuments, downloadDocument, editDocument, deleteDocument, exportDocument} = require('../controllers/DocumentController');
const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({ storage });

router.post('/upload', authMiddleware, upload.single('file'), uploadDocument);

router.get('/', authMiddleware, getMyDocuments);

router.get('/:id/download', authMiddleware, downloadDocument);

router.put('/:id', authMiddleware, editDocument);

router.delete('/:id', authMiddleware, deleteDocument);

router.get('/export', authMiddleware, exportDocument);
module.exports = router;