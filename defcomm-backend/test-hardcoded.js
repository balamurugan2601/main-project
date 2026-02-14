const { Sequelize } = require('sequelize');

console.log('Testing HARDCODED connection...');
const sequelize = new Sequelize('defcomm', 'root', 'tiger123', {
    host: 'localhost', // or '127.0.0.1'
    dialect: 'mysql',
    logging: console.log
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('HARDCODED Connection SUCCESS!');
        await sequelize.close();
    } catch (error) {
        console.error('HARDCODED Connection FAILED:', error.message);
    }
})();
