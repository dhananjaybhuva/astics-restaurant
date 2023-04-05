/****************************
 SECURITY TOKEN HANDLING
 ****************************/
const i18n = require('i18n');
const _ = require('lodash');
const Moment = require('moment');
const jwt = require('jsonwebtoken');

const config = require('./configs');
const User = require('../app/modules/User/Schema').User;
const CommonService = require('../app/services/Common');
const { HTTP_CODE } = require('../app/services/constant');
const { Authtokens } = require('../app/modules/Authentication/Schema');
const { Op } = require('sequelize');

class Globals {
  /********************************************************
  @Purpose Generate Token
  ********************************************************/
  generateToken(params) {
    return new Promise(async (resolve, reject) => {
      try {
        /********************************************************
          Generate header
         ********************************************************/
        let token = jwt.sign(
          {
            id: params._id,
            exp: Math.floor(Date.now() / 1000) + parseInt(config.tokenExpiry),
          },
          config.securityToken
        );

        params.token = token;
        params.userId = params._id;
        params.tokenExpiryTime = Moment().add(parseInt(config.tokenExpirationTime), 'minutes');

        delete params._id;

        /********************************************************
          Fetch user details from the server and update authtoken details
         ********************************************************/
        let fetchUser = await Authtokens.findOne({ where: { userId: params.userId }, raw: true });
        if (fetchUser) {
          let updatedUser = await Authtokens.update({
            accessToken: token,
            tokenExpiryTime: params.tokenExpiryTime,
            ipAddress: params.ipAddress
          }, {
            fields: ['accessToken', 'tokenExpiryTime', 'ipAddress'],
            where: { _id: fetchUser._id }
          });
        } else {
          await Authtokens.create({
            userId: params.userId,
            accessToken: token,
            tokenExpiryTime: params.tokenExpiryTime,
            ipAddress: params.ipAddress
          });
        }
        return resolve(token);
      } catch (err) {
        console.error('Error generateToken', err);
        return reject({ message: err, status: 0 });
      }
    });
  }

  /********************************************************
  @Purpose Authorized user's token
  ********************************************************/
  static isAuthorized(resource) {
    return async (req, res, next) => {
      try {
        /********************************************************
          Get auth token from header
         ********************************************************/
        const token = req.headers.authorization;
        if (!token) {
          return CommonService.handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            i18n.__('TOKEN_WITH_API')
          );
        }
        const authenticate = new Globals();
        /********************************************************
          Check token in DB
         ********************************************************/
        const tokenCheck = await authenticate.checkTokenInDB(token);
        if (!tokenCheck) {
          return CommonService.handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.BAD_REQUEST_CODE,
            i18n.__('INVALID_TOKEN')
          );
        }

        /********************************************************
          Check token Expiration
         ********************************************************/
        const tokenExpire = await authenticate.checkExpiration(token);
        if (!tokenExpire) {
          return CommonService.handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            i18n.__('TOKEN_EXPIRED')
          );
        }

        /********************************************************
          Check User in DB
         ********************************************************/
        const userExist = await authenticate.checkUserInDB(token);
        if (!userExist) {
          return CommonService.handleReject(
            res,
            HTTP_CODE.FAILED,
            HTTP_CODE.UNAUTHORIZED_CODE,
            i18n.__('USER_NOT_EXIST')
          );
        }
        if (userExist) {
          req.currentUser = userExist;
        }
        next();
      } catch (err) {
        console.error('Token authentication :: ', err);
        return CommonService.handleReject(
          res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNAUTHORIZED_CODE,
          err.message
        );
      }
    };
  }
  /********************************************************
  @Purpose Check token in DB
  ********************************************************/
  checkTokenInDB(token) {
    return new Promise(async (resolve, reject) => {
      try {
        /********************************************************
          Convert token into buffer and decode the token
         ********************************************************/
        let tokenDetails = Buffer.from(token, 'binary').toString();
        let decoded = jwt.verify(tokenDetails, config.securityToken, { ignoreExpiration: true });
        if (!decoded) {
          return resolve(false);
        }
        /********************************************************
          Check token is authorized or not
         ********************************************************/
        const authenticate = await Authtokens.findOne({ where: { accessToken: tokenDetails }, raw: true });
        if (authenticate) return resolve(true);
        return resolve(false);
      } catch (err) {
        console.error('Check token in db', err);
        return resolve({ message: err, status: 0 });
      }
    });
  }
  /********************************************************
  @Purpose Check Token Expiration
  ********************************************************/
  checkExpiration(token) {
    return new Promise(async (resolve, reject) => {
      /********************************************************
           Convert token into buffer and decode the token
       ********************************************************/
      let tokenDetails = Buffer.from(token, 'binary').toString();
      let status = false;

      /********************************************************
           Check token Expiration
       ********************************************************/
      const authenticate = await Authtokens.findOne({ where: { accessToken: tokenDetails }, raw: true });
      if (authenticate && authenticate.accessToken) {
        let expiryDate = Moment(authenticate.tokenExpiryTime, 'YYYY-MM-DD HH:mm:ss');
        let now = Moment(new Date(), 'YYYY-MM-DD HH:mm:ss');
        if (expiryDate > now) {
          status = true;
          resolve(status);
        }
      }
      resolve(status);
    });
  }
  /********************************************************
  @Purpose Check user in db
  ********************************************************/
  checkUserInDB(token) {
    return new Promise(async (resolve, reject) => {
      try {
        /********************************************************
          Decode token
         ********************************************************/
        let decoded = jwt.decode(token);
        if (!decoded) {
          return resolve(false);
        }
        let userId = decoded.id;
        /********************************************************
          Check user in DB
         ********************************************************/
        const user = await User.findOne({ where: { _id: userId, isDeleted: false }, raw: true });
        if (user) { return resolve(user); }
        return resolve(false);
      } catch (err) {
        console.error('Check USER in db');
        return reject({ message: err, status: 0 });
      }
    });
  }
}

module.exports = Globals;