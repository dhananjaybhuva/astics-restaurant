const Globals = require('../../../configs/Globals');
const Middleware = require('../../services/middleware');
const Validators = require('./Validator');
const UserController = require('./Controller');
const config = require('../../../configs/configs');

module.exports = (app, express) => {
  const router = express.Router();

  /********************************************************
    Sign up user route
  ********************************************************/
  router.post('/user/signup', Validators.signUpValidator(), Middleware.validateBody, (req, res) => {
    const userObj = new UserController().boot(req, res);
    return userObj.signUp();
  }
  );

  /********************************************************
    User Login route
  ********************************************************/
  router.post('/user/login', Validators.loginValidator(), Middleware.validateBody, (req, res) => {
    const userObj = new UserController().boot(req, res);
    return userObj.login();
  });

  /********************************************************
    User logout route
  ********************************************************/
  router.get('/user/logout', Globals.isAuthorized(), (req, res) => {
    const userObj = new UserController().boot(req, res);
    return userObj.logout();
  });

  /********************************************************
    Image File Upload
  ********************************************************/
  router.post('/image-file-upload', Globals.isAuthorized(), (req, res) => {
    const userObj = new UserController().boot(req, res);
    return userObj.imageFileUpload();
  });

  app.use(config.baseApiUrl, router);
};
