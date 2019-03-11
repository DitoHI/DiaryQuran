const router = require('express').Router();
const userController = require('./userController');
const successResponse = process.env.STATUS_CODE_SUCCESS;
const failedResponse = process.env.STATUS_CODE_FAILED;

router.post('/create', (req, res) => {
  userController.saveUser(req, res);
});

router.get('/me', userController.verifyJWT, userController.me, (req, res) => {
  return res.status(successResponse).json({
    user: req.user,
  })
});

router.post('/login', (req, res) => {
  userController.login(req, res);
});

router.get('/users', userController.listUsers, (req, res) => {
  return res.status(successResponse).json({
    users: req.users,
  })
});

module.exports = router;
