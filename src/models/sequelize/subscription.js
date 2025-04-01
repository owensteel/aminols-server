// Game Sequelize Model

const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Subscription = sequelize.define('Subscription', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_public_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    endpoint: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    p256dh: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    auth: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    // Optional model settings
    modelName: 'notif_subscription',
    tableName: 'notif_subscriptions',
    timestamps: false
});

module.exports = Subscription;