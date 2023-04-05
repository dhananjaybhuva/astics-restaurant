const { DataTypes } = require('sequelize');
const { sequelizeConnection } = require('../../../configs/database');
const { Category } = require("../Category/Schema");

const Item = sequelizeConnection.define('items', {
  _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING },
  image: { type: DataTypes.STRING },
  categoryId: { type: DataTypes.UUID, references: { key: '_id', model: Category } },
  isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
});

Item.belongsTo(Category, { foreignKey: "categoryId", as: "categories" });

module.exports = { Item };
