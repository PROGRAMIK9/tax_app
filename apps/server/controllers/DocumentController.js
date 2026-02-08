const db = require('../db');

// --- UPLOAD DOCUMENT ---
const uploadDocument = async (req, res) => {
    try {
        // 1. Check if file exists (Multer should have handled this)
        if (!req.file) {
            return res.status(400).json({ msg: "No file uploaded" });
        }

        const { document_type } = req.body;
        const userId = req.user.id; // From authMiddleware

        // 2. Extract Cloudinary Data
        // Multer-Storage-Cloudinary puts the file info in req.file
        const fileUrl = req.file.path;      // The HTTPS link
        const publicId = req.file.filename; // The ID for deletion

        console.log("📂 File Uploaded to Cloudinary:", fileUrl);

        // 3. Save Metadata to Database
        const query = `
            INSERT INTO documents (user_id, file_url, public_id, document_type)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;

        const newDoc = await db.query(query, [userId, fileUrl, publicId, document_type]);

        res.json({
            msg: "Upload Successful",
            document: newDoc.rows[0]
        });

    } catch (err) {
        console.error("❌ Upload Error:", err.message);

        // Check if it's a Cloudinary error about encryption
        if (err.message.includes("encrypted") || err.message.includes("password")) {
            return res.status(400).json({ 
                msg: "Upload Failed: This file is password protected. Please unlock it (Print to PDF) and try again." 
            });
        }

        res.status(500).json({ msg: "Server Error during upload" });
    }
};

// --- GET MY DOCUMENTS ---
const getMyDocuments = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            'SELECT * FROM documents WHERE user_id = $1 ORDER BY uploaded_at DESC', 
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Fetch Error:", err.message);
        res.status(500).json({ msg: "Server Error fetching documents" });
    }
};

module.exports = { uploadDocument, getMyDocuments };