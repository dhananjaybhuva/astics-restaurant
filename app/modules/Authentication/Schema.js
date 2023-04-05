/**************************
 AUTHENTICATION SCHEMA INITIALISATION
 **************************/
const { DataTypes } = require('sequelize');
const { sequelizeConnection } = require('../../../configs/database');
const { User } = require('../User/Schema');

let Authtokens = sequelizeConnection.define('authtokens', {
  _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID },
  accessToken: { type: DataTypes.STRING },
  tokenExpiryTime: { type: DataTypes.DATE },
  ipAddress: { type: DataTypes.STRING }
});

Authtokens.belongsTo(User, { sourceKey: 'userId' });

User.hasOne(Authtokens);

module.exports = { Authtokens };
