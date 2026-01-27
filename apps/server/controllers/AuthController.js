const db = require('../db'); // Your DB connection
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// SECRET KEY (In production, put this in .env)
const JWT_SECRET = "temp_secret_key_123"; 

exports.register = async (req, res) => {
    // 1. Destructure the input (What the user sent us)
    const { email, password, full_name, role } = req.body;

    try {
        // 2. Check if user already exists
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: "User already exists!" });
        }

        // 3. Hash the password (Encryption)
        // 10 is the "Salt Rounds" (Complexity cost)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Insert into Database
        // We use $1, $2 to prevent SQL Injection attacks
        const newUser = await db.query(
            'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role',
            [email, hashedPassword, full_name, role || 'user']
        );
        console.log("LOGIN DEBUG: User found in DB:", user); 
        console.log("LOGIN DEBUG: ID being put into Token:", user.id);
        // 5. Success Response
        res.status(201).json({ 
            message: "User Registered Successfully!", 
            user: newUser.rows[0] 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

exports.login = async (req, res) => {
    const {email, password} = req.body;
    try{
        const userCheck = await db.query("SELECT * from users WHERE email = $1", [email]);
        if(userCheck.rows.length === 0){
            return res.status(400).json({error: "Invalid Credentials"});
        }
        const user = userCheck.rows[0];
        console.log("LOGIN DEBUG: User found in DB:", user); 
        console.log("LOGIN DEBUG: ID being put into Token:", user.id);
        const isMatch = await bcrypt.compare(password,user.password_hash);
        if(!isMatch){
            return res.status(400).json({error: "Invalid Credentials"});
        }
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        };
        jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'}, (err, token) => {
            if(err) throw err;
            res.json({token});
        });
    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error");
    }
}