const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",

    user: process.env.DB_USER || "pos_user",

    password: process.env.DB_PASSWORD || "PosStrongPassword123!",

    database: process.env.DB_NAME || "pos_db",

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0
});

module.exports = pool;