const router = require('express').Router();
const userController = require('./userController');

router.post('/create', (req, res) => {
  userController.saveUser(req, res);
});

router.get('/me', userController.verifyJWT, (req, res) => {
  userController.me(req, res);
});

module.exports = router;
