const i18n = require("i18n");
const _ = require('lodash');
const Controller = require('../Base/Controller');
const Globals = require('../../../configs/Globals');
const User = require('./Schema').User;
const CommonService = require('../../services/Common');
const RequestBody = require('../../services/RequestBody');
const Form = require('../../services/Form');
const File = require('../../services/File');
const { HTTP_CODE } = require('../../services/constant');
const { Authtokens } = require('../Authentication/Schema');
const sequelize = require('sequelize');

class UserController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
   @Purpose Create User Profile
   @Parameter
   {
      "firstName": "Nancy",
      "lastName": "Martin",
      "mobile": "+91-0000000000",
      "emailId": "nancy.marting@gmail.com",
      "password": "Password1!"
    }
   @Return JSON String
   ********************************************************/
  async signUp() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      const fieldsArray = ['firstName', 'lastName', 'mobile', 'emailId', 'password'];
      const data = await new RequestBody().processRequestBody(this.req.body, fieldsArray);

      /********************************************************
      Check User in DB and validate
      ********************************************************/
      let checkingUser = await User.findOne({ where: { emailId: data.emailId, isDeleted: false } });
      if (!_.isEmpty(checkingUser)) {
        return CommonService.handleReject(this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          i18n.__("ALREADY_EXISTS_WITH_ABOVE_EMAILID")
        );
      }

      /********************************************************
      Encrypt Password and update in request
      ********************************************************/
      const password = await CommonService.encryptPassword({
        password: this.req.body.password,
      });
      data.password = password;

      /********************************************************
      Add user data into DB and validate
      ********************************************************/
      const userData = await User.create(data);
      if (_.isEmpty(userData)) {
        return CommonService.handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          i18n.__('USER_NOT_SAVED')
        );
      }
      /********************************************************
      Generate and return response
      ********************************************************/
      return CommonService.handleResolve({
        res: this.res,
        status: HTTP_CODE.SUCCESS,
        statusCode: HTTP_CODE.RESOURCE_CREATED_CODE,
        message: i18n.__('REGISTRATION_SUCCESS'),
      });
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.error('Error signUp', error);
      return CommonService.handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        i18n.__('SERVER_ERROR')
      );
    }
  }

  /********************************************************
  @Purpose Login
  @Parameter
  {
        "emailId": "",
        "password":""
  }
  @Return JSON String
  ********************************************************/
  async login() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = ['emailId', 'password'];
      const emptyFields = await new RequestBody().checkEmptyWithFields(this.req.body, fieldsArray);
      if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
        return CommonService.handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY, (i18n.__('SEND_PROPER_DATA')) + ' ' + emptyFields.toString() + ' fields required.');
      }

      const data = await new RequestBody().processRequestBody(this.req.body, fieldsArray);
      const emailId = data.emailId.toString().toLowerCase();
      /********************************************************
      Check User exists in DB or not
      ********************************************************/
      const user = await User.findOne({
        where: { emailId: emailId },
        raw: true,
        attributes: ['_id', 'firstName', 'lastName', 'mobile', 'emailId', 'password']
      });
      if (_.isEmpty(user)) {
        return CommonService.handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNAUTHORIZED_CODE,
          i18n.__('REGISTERED_EMAIL')
        );
      }
      /********************************************************
      Verify Password 
      ********************************************************/
      const status = await CommonService.verifyPassword({
        password: data.password,
        savedPassword: user.password,
      });
      if (!status) {
        return CommonService.handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNAUTHORIZED_CODE,
          i18n.__('INVALID_PASSWORD')
        );
      }

      const tokenData = { _id: user._id };
      tokenData['ipAddress'] = this.req.ip;
      const accessToken = await new Globals().generateToken(tokenData);
      /********************************************************
      Generate and return response
      ********************************************************/
      delete user.password
      const resData = { ...user, accessToken };
      CommonService.handleResolve({
        res: this.res,
        status: HTTP_CODE.SUCCESS,
        statusCode: HTTP_CODE.SUCCESS_CODE,
        message: i18n.__('LOGIN_SUCCESS'),
        data: resData,
      });
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.error('Error Login', error);
      return CommonService.handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        i18n.__('SERVER_ERROR')
      );
    }
  }

  /********************************************************
  @Purpose Logout User
  @Parameter
  {}
  @Return JSON String
  ********************************************************/
  async logout() {
    try {
      /********************************************************
      Get current user's user id
      ********************************************************/
      const currentUser = this.req.currentUser && this.req.currentUser._id ? this.req.currentUser._id : '';
      /********************************************************
      Update token details in authtoken
      ********************************************************/
      await Authtokens.destroy({ where: { userId: currentUser } });
      /********************************************************
      Generate and return response
      ********************************************************/
      return CommonService.handleResolve({
        res: this.res,
        status: HTTP_CODE.SUCCESS,
        statusCode: HTTP_CODE.SUCCESS_CODE,
        message: i18n.__('LOGOUT_SUCCESS'),
      });
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.error('Error logout', error);
      return CommonService.handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        i18n.__('SERVER_ERROR')
      );
    }
  }

  /********************************************************
  @Purpose Single Image File uploading
  @Parameter
  {
    "file":
  }
  @Return JSON String
  ********************************************************/
  async imageFileUpload() {
    try {
      const form = new Form(this.req);
      const formObject = await form.parse();
      /********************************************************
      Check require filed (file).
      ********************************************************/
      if (_.isEmpty(formObject.files) || (formObject.files.file && formObject.files.file[0].size == 0)) {
        return CommonService.handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY,
          i18n.__('%s REQUIRED', "'file'")
        );
      }
      /********************************************************
      Validate the file based on Array of allowed files.
      ********************************************************/
      const array_of_allowed_files = ['png', 'jpeg', 'jpg'];
      const file_extension = formObject.files.file[0].originalFilename.slice(
        ((formObject.files.file[0].originalFilename.lastIndexOf('.') - 1) >>> 0) + 2
      );
      if (!array_of_allowed_files.includes(file_extension)) {
        return CommonService.handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNSUPPORTED_MEDIA_TYPE,
          i18n.__('VALID_IMAGE_FILE_FORMAT')
        );
      }
      /********************************************************
      Upload the file to the server directory
      ********************************************************/
      const file = new File(formObject.files);
      let fileName = '';
      const fileObject = await file.storeImage();
      fileName = fileObject.fileName;
      /********************************************************
      Generate and return response
      ********************************************************/
      return CommonService.handleResolve({
        res: this.res,
        status: HTTP_CODE.SUCCESS,
        statusCode: HTTP_CODE.SUCCESS_CODE,
        message: i18n.__('IMAGE_UPLOAD_SUCCESSFULLY'),
        data: { fileName },
      });
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.error('error imageFileUpload()', error);
      return CommonService.handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        i18n.__('SERVER_ERROR')
      );
    }
  }
}
module.exports = UserController;