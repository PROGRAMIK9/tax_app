const db = require('../db');
const { analyzeDocument } = require('../services/aiservice'); // 👈 Import this!
const axios = require('axios'); // We need this to fetch the file from Cloudinary
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

        const userId = req.user.id;
        const fileUrl = req.file.path;      
        const publicId = req.file.filename; 
        const mimeType = req.file.mimetype; // e.g., 'image/jpeg' or 'application/pdf'

        // 1. Initial Save (Status: PENDING)
        // We save it FIRST so if AI fails, we still have the file.
        const insertQuery = `
            INSERT INTO documents (user_id, file_url, public_id, document_type, status)
            VALUES ($1, $2, $3, $4, 'PENDING') RETURNING *;
        `;
        const newDoc = await db.query(insertQuery, [userId, fileUrl, publicId, req.body.document_type || 'RECEIPT']);
        const docId = newDoc.rows[0].id;

        // 2. Trigger AI Analysis (Async - don't make the user wait too long?)
        // actually, for now, let's await it so we see the result immediately.
        console.log("⏳ Waiting for AI...");
        const aiData = await analyzeDocument(fileUrl, mimeType);

        if (aiData) {
            // 3. Update Database with AI Findings
            const updateQuery = `
                UPDATE documents 
                SET extracted_amount = $1, 
                    extracted_date = $2, 
                    extracted_vendor = $3, 
                    category = $4,
                    confidence_score = $5,
                    audit_notes = $6,
                    status = 'ANALYZED'
                WHERE id = $7 RETURNING *;
            `;
            
            const updatedDoc = await db.query(updateQuery, [
                aiData.amount, 
                aiData.date, 
                aiData.vendor, 
                aiData.category,
                aiData.confidence_score, 
                aiData.audit_notes,
                docId
            ]);

            return res.json({ msg: "Upload & Audit Complete", document: updatedDoc.rows[0] });
        }

        // If AI failed, just return the original upload
        res.json({ msg: "Upload Successful (AI Pending)", document: newDoc.rows[0] });

    } catch (err) {
        console.error("❌ Upload Error:", err.message);
        res.status(500).json({ msg: "Server Error" });
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
        console.log(`📂 Fetched ${result.rows.length} documents for user ${userId}`);
    } catch (err) {
        console.error("❌ Fetch Error:", err.message);
        res.status(500).json({ msg: "Server Error fetching documents" });
    }
};

const downloadDocument = async (req, res) => {
    try {
        const docId = req.params.id;
        const userId = req.user.id;

        // 1. Get DB Record
        const query = 'SELECT * FROM documents WHERE id = $1 AND user_id = $2';
        const result = await db.query(query, [docId, userId]);

        if (result.rows.length === 0) return res.status(404).json({ msg: "Not found" });

        const doc = result.rows[0];
        let fileUrl = doc.file_url;
        let response;

        // 2. The Smart Retry Loop 🔄
        try {
            console.log(`Attempt 1: Fetching ${fileUrl}`);
            response = await axios({ method: 'GET', url: fileUrl, responseType: 'stream' });
        } catch (err1) {
            // If Attempt 1 fails (401/404) AND it's a PDF, try the 'raw' folder
            if (fileUrl.includes('.pdf')) {
                console.log("⚠️ Attempt 1 failed. Retrying with /raw/ URL...");
                const rawUrl = fileUrl.replace('/image/upload/', '/raw/upload/');
                
                try {
                    response = await axios({ method: 'GET', url: rawUrl, responseType: 'stream' });
                    console.log(`✅ Attempt 2 Success: ${rawUrl}`);
                } catch (err2) {
                    // If both fail, give up
                    console.error("❌ Both attempts failed.");
                    throw err2; 
                }
            } else {
                throw err1; // Not a PDF? Then the error is real.
            }
        }
        const contentType = response.headers['content-type'];
        let extension = 'pdf'; // Default fallback

        if (contentType.includes('jpeg') || contentType.includes('jpg')) {
            extension = 'jpg';
        } else if (contentType.includes('png')) {
            extension = 'png';
        } else if (contentType.includes('pdf')) {
            extension = 'pdf';
        }

        // 2. Set the dynamic filename
        res.setHeader('Content-Disposition', `attachment; filename="receipt_${docId}.${extension}"`);
        // 3. Success! Pipe the file 🚿
        res.setHeader('Content-Disposition', `attachment; filename="receipt_${docId}.pdf"`);
        res.setHeader('Content-Type', contentType);
        response.data.pipe(res);

    } catch (err) {
        console.error("🔥 Final Download Error:", err.message);
        res.status(500).send("Could not download file.");
    }
};

module.exports = { uploadDocument, getMyDocuments, downloadDocument };