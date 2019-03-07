const router = require('express').Router();

router.use('/user', require('./user/users'));

module.exports = router;
