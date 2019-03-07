const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = mongoose.model('User');

const successResponse = process.env.STATUS_CODE_SUCCESS;
const failedResponse = process.env.STATUS_CODE_FAILED;
const SECRET = process.env.SECRET;

const displayParameters = 'email username name age';

exports.saveUser = function (req, res) {
  if (!req.body.username || !req.body.email || !req.body.name || !req.body.age) {
    return res.status(failedResponse).json({
      message: 'Please fill the form'
    })
  }

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
      message: err
    })
  });
};

exports.me = function (req, res) {
  const decoded = req.decoded;

  User.findById(decoded.id, displayParameters).exec().then((output) => {
    return res.status(successResponse).json({
      user: output
    })
  }).catch((err) => {
    return res.status(failedResponse).json({
      message: err
    })
  });
};

exports.login = function (req, res) {

};

exports.verifyJWT = function (req, res, next) {
  const token = req.body.token || req.query.token || req.headers.authorization;
  if (!token) {
    return res.status(failedResponse).json({
      message: 'No token provided'
    })
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(failedResponse).json({
        message: 'Failed to fetch token'
      })
    }

    req.decoded = decoded;
    next();
  });
};
