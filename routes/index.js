const passport = require('passport');
const router = require('express').Router();

router.use('/api/diary', require('./api'));

module.exports = router;
