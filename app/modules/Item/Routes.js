const Globals = require('../../../configs/Globals');
const Middleware = require('../../services/middleware');
const Validators = require('./Validator');
const ItemController = require('./Controller');
const config = require('../../../configs/configs');

module.exports = (app, express) => {
  const router = express.Router();

  /********************************************************
    Add new item
  ********************************************************/
  router.post('/item/add',
    Globals.isAuthorized(),
    Validators.addItemValidator(),
    Middleware.validateBody,
    (req, res) => {
      const itemObj = new ItemController().boot(req, res);
      return itemObj.addItem();
    }
  );

  /********************************************************
    Get item list my category id
  ********************************************************/
  router.post('/item/list',
    Globals.isAuthorized(),
    Validators.ItemListingValidator(),
    Middleware.validateBody, (req, res) => {
      const itemObj = new ItemController().boot(req, res);
      return itemObj.listItem();
    }
  );

  app.use(config.baseApiUrl, router);
};
