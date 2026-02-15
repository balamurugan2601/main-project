const { Sequelize } = require('sequelize');

// Create Sequelize instance
const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
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
        await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
        console.log('Database synchronized');
    } catch (error) {
        console.error('Unable to connect to the database:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
