const router = require('express').Router();
const userController = require('../user/userController');
const suratController = require('./suratController');
const successResponse = process.env.STATUS_CODE_SUCCESS;
const failedResponse = process.env.STATUS_CODE_FAILED;

// user must login or create account to get the access
router.get('/add', userController.verifyJWT, userController.me, (req, res) => {
  suratController.addSurat(req).then((result) => {
    res.status(successResponse).json({
      surat: result
    })
  }).catch((log) => {
    res.status(failedResponse).json({
      surat: log
    })
  })
});

module.exports = router;
