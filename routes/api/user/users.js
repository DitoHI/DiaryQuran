const router = require('express').Router();
const userController = require('./userController');
const successResponse = process.env.STATUS_CODE_SUCCESS;
const failedResponse = process.env.STATUS_CODE_FAILED;

const { upload } = require('../../../config');
const fs = require('fs');

router.post('/create', upload.single('photo'), (req, res) => {
  userController.saveUser(req, res).then((result) => {
    res.status(successResponse).json({
      message: 'Successfully create new user',
      user: result
    })
  }).catch((err) => {
    // delete file if failed register
    fs.unlink(req.file.path, function (errDelete) {
      if (errDelete) {
        res.status(failedResponse).json({
          message: errDelete
        })
      }
      res.status(failedResponse).json({
        message: err
      })
    });
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

router.put('/update',
  userController.verifyJWT,
  userController.me,
  upload.single('photo'),
  (req, res) => {
  userController.updateUser(req, res).then((result) => {
    res.status(successResponse).json({
      message: 'Successfully update user',
      user: result
    })
  }).catch((err) => {
    // delete file if failed to update
    fs.unlink(req.file.path, function (errDelete) {
      if (errDelete) {
        res.status(failedResponse).json({
          message: errDelete
        })
      }
      res.status(failedResponse).json({
        message: err
      })
    });
  })
});

router.delete('/delete', userController.verifyJWT, userController.me, (req, res) => {
  userController.deleteUser(req, res).then((result) => {
    // delete image profile
    // after delete
    fs.unlink(result.photo, (err) => {
      if (err) {
        return res.status(failedResponse).json({
          message: 'Failed to delete the image, but user has been deleted',
          user: result
        })
      }
      return res.status(successResponse).json({
        message: 'User deleted',
        user: result
      })
    });
  }).catch((err) => {
    return res.status(failedResponse).json({
      message: err
    })
  });
});

module.exports = router;
