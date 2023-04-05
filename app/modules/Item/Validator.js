/****************************
 Validators
 ****************************/
const i18n = require("i18n");
const _ = require("lodash");
const Joi = require('joi');
const { ListingById } = require('../../services/validators/Common');

class Validators {

  /********************************************************
   @Purpose Function for add item validator
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static addItemValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          title: Joi.string().trim().required().error(new Error(i18n.__("VALID_ITEM_TITLE"))),
          image: Joi.string().trim().required().error(new Error(i18n.__("VALID_IMAGE"))),
          categoryId: Joi.string().guid({ version: 'uuidv4' }).required().error(new Error(i18n.__("VALID_CATEGORY_ID")))
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for item listing by category id
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static ItemListingValidator() {
    return async (req, res, next) => {
      try {
        req.schema = ListingById.keys();
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

}

module.exports = Validators;