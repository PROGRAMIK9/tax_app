const express = require('express');
const {Pool} = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: "postgres://postgres:openaudit@123@localhost:5432/open_audit"
})

app.get("/",(req,res)=>{
    res.send("BAckend is working fine");
});

app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ message: "Database Connected!", time: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database Connection Failed" });
    }
});

// Start Server
app.listen(5000, () => {
    console.log('Server running on port 5000');
});