/****************************
 Validators
 ****************************/
const i18n = require("i18n");
const _ = require("lodash");
const Joi = require('joi');
let commonlyUsedPasswords = require('../../../configs/commonlyUsedPassword').passwords;

class Validators {

  /********************************************************
   @Purpose Function for user signup validator
   @Parameter 
   {}
   @Return JSON String
   ********************************************************/
  static signUpValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          firstName: Joi.string().trim().error(new Error(i18n.__("VALID_FIRST_NAME"))),
          lastName: Joi.string().trim().error(new Error(i18n.__("VALID_LAST_NAME"))),
          mobile: Joi.string().trim().min(10).error(new Error(i18n.__("VALID_NUMBER_NAME"))),
          emailId: Joi.string().trim().email().required().error(new Error(i18n.__("VALID_EMAIL"))),
          password: Joi.string().invalid(...commonlyUsedPasswords).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d].*/).min(8).required().error(new Error(i18n.__("PASSWORD_VALIDATION")))
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  /********************************************************
  @Purpose Function for login validator
  @Parameter 
  {}
  @Return JSON String
  ********************************************************/
  static loginValidator() {
    return async (req, res, next) => {
      try {
        req.schema = Joi.object().keys({
          emailId: Joi.string().trim().email().required().error(new Error(i18n.__("VALID_EMAIL"))),
          password: Joi.string().invalid(...commonlyUsedPasswords).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d].*/).min(8).required().error(new Error(i18n.__("PASSWORD_VALIDATION")))
        });
        next();
      } catch (error) {
        throw new Error(error);
      }
    }
  }

}

module.exports = Validators;