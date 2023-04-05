/****************************
 POSTGRESQL SEQUELIZE CONNECTION
 ****************************/
const config = require('./configs');
const { Sequelize } = require('sequelize');
const glob = require('glob');

const sequelizeConnection = new Sequelize(config.db, {
  logging: false,
  sync: true,
});
const databaseConnection = async () => {
  sequelizeConnection
    .authenticate()
    .then(() => {
      console.log('Primary DB: Postgres connected!');
    })
    .catch((error) => {
      console.error('Postgres connection :( \n', error);
    });

  // getting all model schema and set their relation
  let db = {};
  const modules = '/../app/modules';
  const schemaFiles = glob.sync(__dirname + modules + '/**/*Schema.js');
  schemaFiles.forEach((schema) => {
    const models = require(schema);
    db = { ...db, ...models };
  });

  Object.keys(db).forEach((modelName) => {
    if (modelName && db[modelName] && db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
  return sequelizeConnection;
};

// uncomment below line to create database table as per model schema
sequelizeConnection.sync();

module.exports = { sequelizeConnection, databaseConnection };
