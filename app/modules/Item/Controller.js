const i18n = require("i18n");
const _ = require('lodash');
const Controller = require('../Base/Controller');
const Category = require('../Category/Schema').Category;
const Item = require('./Schema').Item;
const CommonService = require('../../services/Common');
const RequestBody = require('../../services/RequestBody');
const { HTTP_CODE } = require('../../services/constant');
const sequelize = require('sequelize');

class ItemController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
 @Purpose Create New Item
  @Parameter
  {
    "title": "Cheese Pizza",
    "image": "jpg_1680637020371.jpg"
    "categoryId": "7cd3dc24-d6c3-488e-9cd2-99cd9f0d66ff"
  }
   @Return JSON String
   ********************************************************/
  async addItem() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = ['title', 'image', 'categoryId'];
      const emptyFields = await new RequestBody().checkEmptyWithFields(this.req.body, fieldsArray);
      if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
        return CommonService.handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY, (i18n.__('SEND_PROPER_DATA')) + ' ' + emptyFields.toString() + ' fields required.');
      }

      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      const data = await new RequestBody().processRequestBody(this.req.body, fieldsArray);

      /********************************************************
      Check category in DB and validate
      ********************************************************/
      let checkingCategory = await Category.findOne({ where: { _id: data.categoryId, isDeleted: false } });
      if (_.isEmpty(checkingCategory)) {
        return CommonService.handleReject(this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          i18n.__("VALID_CATEGORY_ID")
        );
      }

      /********************************************************
      Check item in DB and validate
      ********************************************************/
      let checkingItem = await Item.findOne({ where: { title: data.title, isDeleted: false } });
      if (!_.isEmpty(checkingItem)) {
        return CommonService.handleReject(this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          i18n.__("%s ALREADY_EXISTS", "Item")
        );
      }

      /********************************************************
      Add Item into DB and validate
      ********************************************************/
      const itemData = await Item.create(data);
      if (_.isEmpty(itemData)) {
        return CommonService.handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          i18n.__('ITEM_NOT_SAVED')
        );
      }
      /********************************************************
      Generate and return response
      ********************************************************/
      return CommonService.handleResolve({
        res: this.res,
        status: HTTP_CODE.SUCCESS,
        statusCode: HTTP_CODE.RESOURCE_CREATED_CODE,
        message: i18n.__('ITEM_SUCCESS'),
      });
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.error('Error addItem', error);
      return CommonService.handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        i18n.__('SERVER_ERROR')
      );
    }
  }

  /********************************************************
  @Purpose Item Listing by Category Id.
  @Parameter
  {
      "page":1,
      "pagesize":10,
      "categoryId": "7cd3dc24-d6c3-488e-9cd2-99cd9f0d66ff"
  }
  @Return JSON String
  ********************************************************/
  async listItem() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      let fieldsArray = ['page', 'pageSize', 'categoryId'];
      const emptyFields = await new RequestBody().checkEmptyWithFields(this.req.body, fieldsArray);
      if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
        return CommonService.handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.UNPROCESSABLE_ENTITY, (i18n.__('SEND_PROPER_DATA')) + ' ' + emptyFields.toString() + ' fields required.');
      }
      let bodyData = this.req.body, sort = [['createdAt', 'DESC']];
      const skip = (bodyData.page - 1) * bodyData.pageSize;
      /********************************************************
      Check category in DB and validate
      ********************************************************/
      let checkingCategory = await Category.findOne({ where: { _id: bodyData.categoryId, isDeleted: false } });
      if (_.isEmpty(checkingCategory)) {
        return CommonService.handleReject(this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          i18n.__("VALID_CATEGORY_ID")
        );
      }
      /********************************************************
      list and count data according to query
      ********************************************************/
      const { count, rows } = await Item.findAndCountAll({
        limit: bodyData.pageSize,
        offset: skip,
        order: sort,
        where: { categoryId: bodyData.categoryId, isDeleted: false },
        attributes: ['_id', 'title', 'image', 'categoryId']
      });
      const total = count;

      /********************************************************
      Generate and return response
      ********************************************************/
      return CommonService.handleResolve({
        res: this.res,
        status: HTTP_CODE.SUCCESS,
        statusCode: HTTP_CODE.SUCCESS_CODE,
        message: i18n.__('GET_ITEM_LIST_SUCCESSFULLY'),
        data: rows,
        page: bodyData.page,
        perPage: bodyData.pageSize,
        total: total
      });
    } catch (error) {
      /********************************************************
       Manage Error logs and Response
       ********************************************************/
      console.log('error listItem()', error);
      return CommonService.handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        i18n.__('SERVER_ERROR')
      );
    }
  }
}
module.exports = ItemController;