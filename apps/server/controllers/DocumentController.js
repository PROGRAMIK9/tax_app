const db = require('../db');
const { analyzeDocument } = require('../services/aiservice'); // 👈 Import this!

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
    } catch (err) {
        console.error("❌ Fetch Error:", err.message);
        res.status(500).json({ msg: "Server Error fetching documents" });
    }
};

module.exports = { uploadDocument, getMyDocuments };