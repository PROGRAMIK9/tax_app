const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/authMiddleware');
// Registration Route
router.post('/register', authController.register);
router.post('/login', authController.login);
// GET http://localhost:5000/auth/me
// This route uses "authMiddleware" as a second argument!
router.get('/me', authMiddleware, async (req, res) => {
    try {
        // We can now access req.user because the middleware put it there!
        // Let's return the user's data (simulated for now)
        res.json({ 
            message: "You are authorized!", 
            my_user_id: req.user.id,
            my_role: req.user.role
        });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});
module.exports = router;