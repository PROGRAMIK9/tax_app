const jwt = require('jsonwebtoken');
const JWT_SECRET = "temp_secret_key_123";
module.exports = async function(req,res,next){
    const token = req.header('Authorization');
    if(!token){
        return res.status(401).json({error: "No token, authorization denied"});
    }
    try{
        const verification = jwt.verify(token, JWT_SECRET);
        req.user = verification;
        next();
    }catch(err){
        res.status(401).json({error: "Token is not valid"});
    }
}