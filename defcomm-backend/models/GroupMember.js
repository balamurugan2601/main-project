const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Junction table for many-to-many relationship between Users and Groups
const GroupMember = sequelize.define('GroupMember', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'groups',
            key: 'id',
        },
    },
}, {
    tableName: 'group_members',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'groupId'],
        },
        {
            fields: ['groupId'],
        },
    ],
});

module.exports = GroupMember;
