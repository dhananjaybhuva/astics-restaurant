const Joi = require('joi');
const i18n = require('i18n');

const Listing = Joi.object({
  page: Joi.number().required().error(new Error(i18n.__('VALID_PAGE'))),
  pageSize: Joi.number().required().error(new Error(i18n.__('VALID_PAGESIZE')))
}).unknown(true);

const ListingById = Joi.object({
  page: Joi.number().required().error(new Error(i18n.__('VALID_PAGE'))),
  pageSize: Joi.number().required().error(new Error(i18n.__('VALID_PAGESIZE'))),
  categoryId: Joi.string().guid({ version: 'uuidv4' }).required().error(new Error(i18n.__("VALID_CATEGORY_ID")))
}).unknown(true);
module.exports = { Listing, ListingById };
