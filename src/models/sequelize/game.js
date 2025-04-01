// Game Sequelize Model

const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Game = sequelize.define('Game', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    public_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    state_data: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    server_seconds_elapsed: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    creator_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    // Optional model settings
    modelName: 'game',
    tableName: 'games',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Game;