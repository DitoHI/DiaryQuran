const router = require('express').Router();
const userController = require('./userController');

router.post('/create', (req, res) => {
  userController.saveUser(req, res);
});

module.exports = router;
