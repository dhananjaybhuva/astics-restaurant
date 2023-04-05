/****************************
 SERVER MAIN FILE
 ****************************/

// need to add in case of self-signed certificate connection
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

// Include Modules
const path = require('path');
const i18n = require('i18n');

const config = require('./configs/configs');
const express = require('./configs/express');

// postgresql database connection
const { databaseConnection, } = require('./configs/database');
databaseConnection();

// MongoDB database connection
let mongoose = require('./configs/mongoose');
db = mongoose();

let cronService = require('./app/services/Cron');
i18n.configure({
  locales: ['en'],
  directory: __dirname + '/app/locales',
  defaultLocale: 'en',
});

global.appRoot = path.resolve(__dirname);

const app = express();

app.get('/', function (req, res) {
  res.send('Hello World');
});

(new cronService()).scheduleCronJobs();

// Listening Server
app.listen(parseInt(config.serverPort), async () => {
  console.log('process.env.NODE_ENV', process.env.NODE_ENV);
  console.log(`Server connected with db (connection url) : ${config.db}`);
  console.log(`Server running at http://localhost:${config.serverPort}`);
});
