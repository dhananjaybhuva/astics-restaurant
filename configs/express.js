/****************************
 EXPRESS AND ROUTING HANDLING
 ****************************/

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors'); //For cross domain error
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const config = require('./configs');
const { WHITELISTED_URLS } = require('../app/services/constant');

module.exports = function () {
  console.log('env - ' + process.env.NODE_ENV);
  const app = express();

  app.use(
    bodyParser.urlencoded({
      limit: '50mb',
      extended: true,
    })
  );

  app.use(bodyParser.json());

  let corsOptions = {
    origin: WHITELISTED_URLS, // Compliant
  };
  app.use(cors(corsOptions));

  // =======   Settings for CORS
  app.use((req, res, next) => {
    const origin = req.header('Origin');

    if (WHITELISTED_URLS.indexOf(origin) >= 0) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.use(haltOnTimedout);

  function haltOnTimedout(req, res, next) {
    if (!req.timedout) next();
  }

  app.use((err, req, res, next) => {
    return res.send({
      status: 0,
      statusCode: 500,
      message: err.message,
      error: err,
    });
  });

  app.use(
    session({
      cookie: { maxAge: 30000 },
      saveUninitialized: true,
      resave: true,
      secret: config.sessionSecret,
    })
  );

  app.use(express.json());

  // =======   Routing
  const modules = '/../app/modules';
  glob(__dirname + modules + '/**/*Routes.js', {}, (err, files) => {
    files.forEach((route) => {
      const stats = fs.statSync(route);
      const fileSizeInBytes = stats.size;
      if (fileSizeInBytes) {
        require(route)(app, express);
      }
    });
  });

  return app;
};
