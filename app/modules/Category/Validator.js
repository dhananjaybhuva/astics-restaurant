/****************************
 Validators
 ****************************/
const i18n = require("i18n");
const _ = require("lodash");
const Joi = require('joi');
const { Listing } = require('../../services/validators/Common');
class Validators {

  /********************************************************
   @Purpose Function for add category validator
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static addCategoryValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          title: Joi.string().trim().required().error(new Error(i18n.__("VALID_CATEGORY_TITLE")))
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
   @Purpose Function for Category listing
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static CategoryListingValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Listing.keys();
        next();
      } catch (error) {
        throw new Error(error);
      }
    };
  }

}

module.exports = Validators;