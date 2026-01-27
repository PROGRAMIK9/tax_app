const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../db');
// Registration Route
router.post('/register', authController.register);
router.post('/login', authController.login);
// GET http://localhost:5000/auth/me
// This route uses "authMiddleware" as a second argument!
router.get('/me', authMiddleware, async (req, res) => {
    try {
        // We can now access req.user because the middleware put it there!
        // Let's return the user's data (simulated for now)
        console.log("--------------------------------");
        console.log("WHO IS LOGGED IN? (req.user):", req.user); 
        console.log("--------------------------------");
        // ------------------------------

        // Only run the query if we have an ID
        if (!req.user || !req.user.user.id) {
             return res.status(400).json({ error: "Token is missing ID" });
        }

        const result = await db.query('SELECT id, full_name, email, role FROM users WHERE id = $1', [req.user.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(result.rows[0]);
        /*res.json({ 
            message: "You are authorized!", 
            my_user_id: req.user.id,
            my_role: req.user.role
        });*/
    } catch (err) {
        res.status(500).send("Server Error");
    }
});
module.exports = router;