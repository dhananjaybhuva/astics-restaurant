const { DataTypes } = require('sequelize');
const { sequelizeConnection } = require('../../../configs/database');

const User = sequelizeConnection.define('users', {
  _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  mobile: { type: DataTypes.STRING },
  emailId: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING },
  isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: { type: DataTypes.BOOLEAN, defaultValue: true }
});

module.exports = { User };
