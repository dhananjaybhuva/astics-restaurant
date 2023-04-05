/****************************
 SCHEDULE CRON JOBS
 ****************************/
const cron = require('node-cron');
const _ = require("lodash");
const CronController = require('./Cron/Controller');

class Cron {
    constructor() { }
    scheduleCronJobs() {
        console.log('scheduleCronJobs');
        // Cron for Each 10 minute
        cron.schedule('*/10 * * * *', async () => {
            try {
                /********************************************************
                Purpose: Migrate data from relational db to mongodb.
                ********************************************************/
                // User migration script
                new CronController().userMigrationCronJob();

                // Category migration script
                new CronController().categoryMigrationCronJob();

                // Item migration script
                new CronController().itemMigrationCronJob();

            } catch (error) {
                console.log('error in cron', error);
            }
        })
    }
}

module.exports = Cron;