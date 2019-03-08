const router = require('express').Router();

router.use('/user', require('./user/users'));
router.use('/quran', require('./surat/surats'));

module.exports = router;
