const router = require('express').Router();
const userController = require('../user/userController');
const suratController = require('./suratController');
const successResponse = process.env.STATUS_CODE_SUCCESS;
const failedResponse = process.env.STATUS_CODE_FAILED;

// user must login or create account to get the access
router.get('/initialize', (req, res) => {
  suratController.initializeDataset().then((result) => {
    res.status(successResponse).json({
      surat: result
    })
  }).catch((log) => {
    res.status(failedResponse).json({
      surat: log
    })
  })
});

router.get('/read'
  , userController.verifyJWT
  , userController.me
  , suratController.findSurat
  , suratController.findAyatFromSurat
  , (req, res) => {
  if (req.ayats) {
    res.status(successResponse).json({
      ayat: req.ayats,
      surat: {
        suratName: req.surats[0].name,
        suratNameLatin: req.surats[0].nameLatin,
        suratNameTranslation: req.surats[0].nameTranslation,
        suratNumber: req.surats[0].number,
      },
      message: 'Success to add bookmark',
    })
  }

  });

router.get('/yourRead'
  , userController.verifyJWT
  , userController.me
  , suratController.findAyatById
  , (req, res) => {
  return res.status(successResponse).json(req.ayat)
});

router.put('/formatRead',
  userController.verifyJWT,
  userController.me,
  (req, res) => {
  res.send(req.user);
});

module.exports = router;
