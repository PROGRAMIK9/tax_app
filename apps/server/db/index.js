const { Pool, types } = require('pg');
const isProduction = process.env.NODE_ENV === 'production';
types.setTypeParser(1082, (str) => str);
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};