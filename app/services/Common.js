/****************************
 Common services
 ****************************/
const i18n = require('i18n');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const Config = require('../../configs/configs');
const { Op } = require('sequelize');

class Common {
  /********************************************************
  @Purpose Encrypt password
  @Parameter
  {
    "data":{
      "password" : "test123"
    }
  }
  @Return JSON String
  ********************************************************/
  encryptPassword(data) {
    return new Promise(async (resolve, reject) => {
      try {
        if (data && data.password) {
          let password = bcrypt.hashSync(data.password, 10);
          return resolve(password);
        }
        return resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  /********************************************************
  @Purpose Compare password
  @Parameter
  {
    "data":{
        "password" : "Buffer data", // Encrypted password
        "savedPassword": "Buffer data" // Encrypted password
    }
  }
  @Return JSON String
  ********************************************************/
  verifyPassword(data) {
    return new Promise(async (resolve, reject) => {
      try {
        let isVerified = false;
        if (data && data.password && data.savedPassword) {
          let base64data = Buffer.from(data.savedPassword, 'binary').toString();
          isVerified = await bcrypt.compareSync(data.password, base64data);
        }
        return resolve(isVerified);
      } catch (error) {
        reject(error);
      }
    });
  }
  /********************************************************
  @Purpose Validate password
  @Parameter
  {
    "data":{
      "password" : "test123",
      "userObj": {}
    }
  }
  @Return JSON String
  ********************************************************/
  validatePassword(data) {
    return new Promise(async (resolve, reject) => {
      try {
        if (data && data.password) {
          if (data.userObj && _.isEqual(data.password, data.userObj.firstName)) {
            return resolve({
              status: 0,
              message: i18n.__('PASSWORD_NOT_SAME_FIRSTNAME'),
            });
          }
          // Check new password is already used or not
          if (
            Config.dontAllowPreviouslyUsedPassword &&
            Config.dontAllowPreviouslyUsedPassword == 'true' &&
            data.userObj &&
            data.userObj.previouslyUsedPasswords &&
            Array.isArray(data.userObj.previouslyUsedPasswords) &&
            data.userObj.previouslyUsedPasswords.length
          ) {
            let isPreviouslyUsed = _.filter(data.userObj.previouslyUsedPasswords, (previouslyUsedPassword) => {
              let base64data = Buffer.from(previouslyUsedPassword, 'binary').toString();
              return bcrypt.compareSync(data.password, base64data);
            });
            if (isPreviouslyUsed && Array.isArray(isPreviouslyUsed) && isPreviouslyUsed.length) {
              return resolve({
                status: 0, message: i18n.__('ALREADY_USED_PASSWORD')
              });
            }
          }
          return resolve({
            status: 1, message: i18n.__('GET_DETAIL_SUCCESSFULLY')
          });
        } else {
          return resolve({
            status: 0, message: i18n.__('PASSWORD_VALIDATION')
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /********************************************************
 @Purpose Handle Success Response
  @Parameter
  {
    res, status, statusCode, message, data,meta, page, perPage, total
  }
  @Return JSON String
  ********************************************************/
  handleResolve(resolveParams) {
    const { res, status, statusCode, message, data, meta, page, perPage, total } = resolveParams;
    return res.status(statusCode).send({
      status,
      statusCode,
      message,
      data,
      page,
      perPage,
      total,
      extraMeta: meta,
    });
  }

  /********************************************************
  @Purpose Handle Error Response
  @Parameter
  {
    res, status, statusCode, message
  }
  @Return JSON String
  ********************************************************/
  handleReject(res, status, statusCode, message) {
    return res.status(statusCode).send({
      status: status,
      statusCode: statusCode,
      message: message,
    });
  }
}

module.exports = new Common();
