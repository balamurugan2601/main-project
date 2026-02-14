const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('Environment Debug:');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 'NULL');
console.log('DB_HOST:', process.env.DB_HOST);

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
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
