const express = require('express');
const cors = require('cors');
const db = require('./db'); // Your DB connection
const taxRoutes = require('./routes/taxRoutes');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

app.use(cors());
app.use(express.json());

app.use('/auth', require('./routes/authRoutes'));
app.use('/tax', taxRoutes);
app.get("/",(req,res)=>{
    res.send("BAckend is working fine");
});

app.get('/debug', async (req, res) => {
    try {
        // Ask Postgres: "Who am I?" and "What tables do I have?"
        const dbName = await db.query('SELECT current_database()');
        const tables = await db.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
        
        res.json({
            "I_AM_CONNECTED_TO": dbName.rows[0].current_database,
            "TABLES_I_CAN_SEE": tables.rows.map(r => r.tablename)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(process.env.PORT || 5000, () => {
    console.log('Server running on port ' + (process.env.PORT || 5000));
});