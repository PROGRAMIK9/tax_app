const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
    // 1. Get Token from Header
    const token = req.header('Authorization');

    // 2. Debugging Log (Check Render Logs if this appears)
    // console.log("Auth Header:", token); 

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // 3. Remove "Bearer " prefix if present
        const cleanToken = token.replace('Bearer ', '').trim();

        // 4. Verify
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

        // 5. Attach User to Request
        req.user = decoded;
        
        // Handle the "Nested User" structure automatically
        if (decoded.user) {
            req.user = decoded.user;
        }

        next();
    } catch (err) {
        console.error("Token Verification Failed:", err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};