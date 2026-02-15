const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('Environment Debug:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (using connection string)' : 'Not set');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);

// Use same configuration as config/db.js
const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production'
                ? { require: true, rejectUnauthorized: false }
                : false
        }
    })
    : new Sequelize(
        process.env.DB_NAME || 'defcomm',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || 'tiger123',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            dialect: 'mysql',
            logging: false
        }
    );

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error.message);
        process.exit(1);
    }
})();
