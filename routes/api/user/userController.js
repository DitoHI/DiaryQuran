const mongoose = require('mongoose');
const successResponse = process.env.STATUS_CODE_SUCCESS;
const failedResponse = process.env.STATUS_CODE_FAILED;
const User = mongoose.model('User');

exports.saveUser = function(req, res) {
  const user = new User();

  user.username = req.body.username;
  user.email = req.body.email;
  user.name = req.body.name;
  user.age = req.body.age;
  user.setPassword(req.body.password);

  user.save().then(function () {
    return res.status(successResponse).json({
      user: user.toAuthJSON()
    })
  }).catch((err) => {
    return res.status(failedResponse).json({
      error: err
    })
  });
};
