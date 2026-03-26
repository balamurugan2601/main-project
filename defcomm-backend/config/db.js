const { Sequelize } = require('sequelize');

// Strip ssl-mode from Aiven URLs — MySQL2 uses dialectOptions.ssl, not ssl-mode query param
const getRawDbUrl = () => {
    const url = process.env.DATABASE_URL;
    if (!url) return null;
    try {
        const parsed = new URL(url);
        parsed.searchParams.delete('ssl-mode');
        return parsed.toString();
    } catch {
        return url;
    }
};

// Create Sequelize instance
const dbUrl = getRawDbUrl();
const sequelize = dbUrl
    ? new Sequelize(dbUrl, {
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production'
                ? { require: true, rejectUnauthorized: false }
                : false
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    })
    : new Sequelize(
        process.env.DB_NAME || 'defcomm',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || 'tiger123',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            dialect: 'mysql',
            logging: process.env.NODE_ENV === 'development' ? console.log : false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000,
            },
        }
    );


const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Database connected successfully');

        // Sync all models (create tables if they don't exist)
        await sequelize.sync({ alter: false });
        console.log('Database synchronized');
    } catch (error) {
        console.error('FATAL: Unable to connect to the database:', error.message);
        console.error('Please check DATABASE_URL in Render environment variables.');
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
