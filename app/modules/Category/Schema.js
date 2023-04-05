const { DataTypes } = require('sequelize');
const { sequelizeConnection } = require('../../../configs/database');

const Category = sequelizeConnection.define('categories', {
  _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING },
  isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = { Category };
