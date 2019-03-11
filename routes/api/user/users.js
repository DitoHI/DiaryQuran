const router = require('express').Router();
const userController = require('./userController');
const successResponse = process.env.STATUS_CODE_SUCCESS;
const failedResponse = process.env.STATUS_CODE_FAILED;

const { upload } = require('../../../config');

router.post('/create', upload.single('image'), (req, res) => {
  userController.saveUser(req, res).then((result) => {
    res.status(successResponse).json({
      user: result
    })
  }).catch((err) => {
    res.status(failedResponse).json({
      message: err
    })
  })
});

router.get('/me', userController.verifyJWT, userController.me, (req, res) => {
  return res.status(successResponse).json({
    user: req.user,
  })
});

router.post('/login', (req, res) => {
  userController.login(req, res);
});

router.get('/list', userController.listUsers, (req, res) => {
  return res.status(successResponse).json({
    users: req.users,
  })
});

router.delete('/delete', userController.verifyJWT, userController.me, (req, res) => {
  userController.deleteUser(req, res);
});

module.exports = router;
