const _ = require('lodash');
const Controller = require('../../modules/Base/Controller');
/********************************************************
Postgres Database Schema
********************************************************/
const pgUser = require('../../modules/User/Schema').User;
const pgCategory = require('../../modules/Category/Schema').Category;
const pgItem = require('../../modules/Item/Schema').Item;
/********************************************************
MongoDB Database Schema
********************************************************/
const { Users, Category, Items } = require('./Schema');

class CronController extends Controller {
    constructor() {
        super();
    }

    /********************************************************
    @Purpose User data Migration
    ********************************************************/
    async userMigrationCronJob() {
        try {
            /********************************************************
             Find all users from PG User table
             ********************************************************/
            pgUser.findAll({ raw: true, attributes: { exclude: ['_id'] } }).then((allPgUsers) => {
                allPgUsers.forEach(async (singleUser) => {
                    /********************************************************
                     Check each record in mongo collection, if not found then create new one. 
                     ********************************************************/
                    let mdSingleUser = await Users.findOne({ emailId: singleUser.emailId });
                    if (_.isEmpty(mdSingleUser)) {
                        await Users.create(singleUser);
                    }
                });
            });
            /********************************************************
             Success Logs
             ********************************************************/
            console.log('Success userMigrationCronJob()');
        } catch (error) {
            /********************************************************
             Manage Error logs
             ********************************************************/
            console.log('error userMigrationCronJob()', error);
        }
    }

    /********************************************************
    @Purpose Category data Migration
    ********************************************************/
    async categoryMigrationCronJob() {
        try {
            /********************************************************
             Find all Categories from PG Category table
             ********************************************************/
            pgCategory.findAll({ raw: true, attributes: { exclude: ['_id'] } }).then((allPgCategories) => {
                allPgCategories.forEach(async (singleCategory) => {
                    /********************************************************
                     Check each record in mongo collection, if not found then create new one. 
                     ********************************************************/
                    let mdSingleCategory = await Category.findOne({ title: singleCategory.title });
                    if (_.isEmpty(mdSingleCategory)) {
                        await Category.create(singleCategory);
                    }
                });
            });
            /********************************************************
             Success Logs
             ********************************************************/
            console.log('Success categoryMigrationCronJob()');
        } catch (error) {
            /********************************************************
             Manage Error logs
             ********************************************************/
            console.log('error categoryMigrationCronJob()', error);
        }
    }

    /********************************************************
    @Purpose Item data Migration
    ********************************************************/
    async itemMigrationCronJob() {
        try {
            /********************************************************
            Find all Items from PG Item table
            ********************************************************/
            pgItem.findAll({ raw: true, attributes: { exclude: ['_id'] } }).then((allPgItems) => {
                allPgItems.forEach(async (singleItem) => {
                    /********************************************************
                     Check each record in mongo collection, if not found then create new one. 
                     ********************************************************/
                    let mdSingleItem = await Items.findOne({ title: singleItem.title });
                    if (_.isEmpty(mdSingleItem)) {
                        /********************************************************
                        Get pg category title and match with mongodb category record and assign it's id to new item record 
                        ********************************************************/
                        let pdCategoryId = await pgCategory.findOne({ where: { _id: singleItem.categoryId, isDeleted: false }, raw: true });
                        if (pdCategoryId) {
                            let mdCategoryId = await Category.findOne({ title: pdCategoryId.title });
                            singleItem.categoryId = (mdCategoryId) ? mdCategoryId._id : "";
                        }
                        await Items.create(singleItem);
                    }
                });
            });
            /********************************************************
             Success Logs
             ********************************************************/
            console.log('Success itemMigrationCronJob()');
        } catch (error) {
            /********************************************************
             Manage Error logs
             ********************************************************/
            console.log('error itemMigrationCronJob()', error);
        }
    }
}
module.exports = CronController;