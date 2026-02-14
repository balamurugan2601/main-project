const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
    const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;
    console.log('Connecting with:', { host: DB_HOST, user: DB_USER, port: DB_PORT, db: DB_NAME });
    console.log('Password length:', DB_PASSWORD ? DB_PASSWORD.length : 0);

    try {
        const connection = await mysql.createConnection({
            host: DB_HOST || 'localhost',
            user: DB_USER || 'root',
            password: DB_PASSWORD || 'tiger123',
            port: DB_PORT || 3306,
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME || 'defcomm'}\`;`);
        console.log(`Database '${DB_NAME || 'defcomm'}' created or already exists.`);

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error creating database:', error);
        process.exit(1);
    }
}

createDatabase();
