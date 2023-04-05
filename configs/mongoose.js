/****************************
 MONGOOSE SCHEMAS
 ****************************/
let config = require('./configs');
let mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports = function () {
    var db = mongoose.connect(config.mongodb).then(
        (connect) => { console.log('Cron DB: MongoDB connected!') },
        (err) => { console.log('MongoDB connection error', err) }
    );
    return db;
};
