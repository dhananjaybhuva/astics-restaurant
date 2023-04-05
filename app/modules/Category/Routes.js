const Globals = require('../../../configs/Globals');
const Middleware = require('../../services/middleware');
const Validators = require('./Validator');
const CategoryController = require('./Controller');
const config = require('../../../configs/configs');

module.exports = (app, express) => {
  const router = express.Router();

  /********************************************************
    Add new category
  ********************************************************/
  router.post('/category/add',
    Globals.isAuthorized(),
    Validators.addCategoryValidator(),
    Middleware.validateBody, (req, res) => {
      const categoryObj = new CategoryController().boot(req, res);
      return categoryObj.addCategory();
    }
  );

  /********************************************************
    Get category list
  ********************************************************/
  router.post('/category/list',
    Globals.isAuthorized(),
    Validators.CategoryListingValidator(),
    Middleware.validateBody, (req, res) => {
      const categoryObj = new CategoryController().boot(req, res);
      return categoryObj.listCategory();
    }
  );

  app.use(config.baseApiUrl, router);
};
