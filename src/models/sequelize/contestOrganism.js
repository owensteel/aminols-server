// Contest Organism Sequelize Model

const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const ContestOrganism = sequelize.define('ContestOrganism', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    organism_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    creator_public_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    game_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    server_seconds_at_entry: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
    }
}, {
    // Optional model settings
    modelName: 'contest_organism',
    tableName: 'contest_organisms',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = ContestOrganism;