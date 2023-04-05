const i18n = require("i18n");
const _ = require('lodash');
const Controller = require('../Base/Controller');
const Category = require('./Schema').Category;
const CommonService = require('../../services/Common');
const RequestBody = require('../../services/RequestBody');
const { HTTP_CODE } = require('../../services/constant');
const sequelize = require('sequelize');

class CategoryController extends Controller {
  constructor() {
    super();
  }

  /********************************************************
   @Purpose Create New Category
   @Parameter
   {
      "title": "Pizza"
    }
   @Return JSON String
   ********************************************************/
  async addCategory() {
    try {
      /********************************************************
      Generate Field Array and process the request body
      ********************************************************/
      const fieldsArray = ['title'];
      const data = await new RequestBody().processRequestBody(this.req.body, fieldsArray);

      /********************************************************
      Check Category in DB and validate
      ********************************************************/
      let checkingCategory = await Category.findOne({ where: { title: data.title, isDeleted: false } });
      if (!_.isEmpty(checkingCategory)) {
        return CommonService.handleReject(this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          i18n.__("%s ALREADY_EXISTS", "Category")
        );
      }

      /********************************************************
      Add category into DB and validate
      ********************************************************/
      const categoryData = await Category.create(data);
      if (_.isEmpty(categoryData)) {
        return CommonService.handleReject(
          this.res,
          HTTP_CODE.FAILED,
          HTTP_CODE.SUCCESS_CODE,
          i18n.__('CATEGORY_NOT_SAVED')
        );
      }
      /********************************************************
      Generate and return response
      ********************************************************/
      return CommonService.handleResolve({
        res: this.res,
        status: HTTP_CODE.SUCCESS,
        statusCode: HTTP_CODE.RESOURCE_CREATED_CODE,
        message: i18n.__('CATEGORY_SUCCESS'),
      });
    } catch (error) {
      /********************************************************
      Manage Error logs and Response
      ********************************************************/
      console.error('Error addCategory', error);
      return CommonService.handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        i18n.__('SERVER_ERROR')
      );
    }
  }

  /********************************************************
  @Purpose Category Listing
  @Parameter
  {
      "page":1,
      "pagesize":10
  }
  @Return JSON String
  ********************************************************/
  async listCategory() {
    try {
      let bodyData = this.req.body, sort = [['createdAt', 'DESC']];
      const skip = (bodyData.page - 1) * bodyData.pageSize;
      /********************************************************
      list and count data according to query
      ********************************************************/
      const { count, rows } = await Category.findAndCountAll({
        limit: bodyData.pageSize,
        offset: skip,
        order: sort,
        where: { isDeleted: false },
        attributes: ['_id', 'title']
      });
      const total = count;

      /********************************************************
      Generate and return response
      ********************************************************/
      return CommonService.handleResolve({
        res: this.res,
        status: HTTP_CODE.SUCCESS,
        statusCode: HTTP_CODE.SUCCESS_CODE,
        message: i18n.__('GET_CATEGORY_LIST_SUCCESSFULLY'),
        data: rows,
        page: bodyData.page,
        perPage: bodyData.pageSize,
        total: total
      });
    } catch (error) {
      /********************************************************
       Manage Error logs and Response
       ********************************************************/
      console.log('error listCategory()', error);
      return CommonService.handleReject(
        this.res,
        HTTP_CODE.FAILED,
        HTTP_CODE.SERVER_ERROR_CODE,
        i18n.__('SERVER_ERROR')
      );
    }
  }
}
module.exports = CategoryController;