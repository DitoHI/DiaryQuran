const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = mongoose.model('User');
const bcrypt = require('bcrypt');

const successResponse = process.env.STATUS_CODE_SUCCESS;
const failedResponse = process.env.STATUS_CODE_FAILED;
const SECRET = process.env.SECRET;
const SALT = parseInt(process.env.DEFAULT_SALT_ROUNDS);

const displayParameters = 'email username name age';

exports.saveUser = function (req, res) {
  if (!req.body.username || !req.body.email || !req.body.name || !req.body.age) {
    return res.status(failedResponse).json({
      message: process.env.LOG_FORM_NOT_FILLED
    })
  }

  const user = new User();

  user._id = new mongoose.Types.ObjectId();
  user.username = req.body.username;
  user.email = req.body.email;
  user.name = req.body.name;
  user.age = req.body.age;
  user.photo = req.file.path;

  return new Promise((resolve, reject) => {
    // hash the password
    bcrypt.hash(req.body.password, SALT, function (err, hash) {
      if (err) {
        reject(err);
      }
      user.password = hash;

      user.save().then(function () {
        return resolve(user.toAuthJSON());
      }).catch((err) => {
        return reject(err);
      });

    });
  });
};

exports.listUsers = function (req, res, next) {
  User.find().exec().then((output) => {
    req.users = output;
    next();
  }).catch((err) => {
    return res.status(failedResponse).json({
      message: err
    })
  });
};

exports.me = function (req, res, next) {
  const decoded = req.decoded;

  User.findById(decoded.id, displayParameters).exec().then((output) => {
    req.user = output;
    next();
  }).catch((err) => {
    return res.status(failedResponse).json({
      message: err
    })
  });
};

exports.login = function (req, res) {
  if (!req.body.username || !req.body.email || !req.body.password) {
    return res.status(failedResponse).json({
      message: process.env.LOG_FORM_NOT_FILLED
    })
  }

  const user = {
    username: req.body.username,
    email: req.body.email,
  };

  User.find(user).exec().then(async (output) => {
    if (output.length === 0) {
      return res.status(failedResponse).json({
        message: 'No user found'
      })
    }

    const password = req.body.password;
    const valid = await bcrypt.compare(password, output[0].password).then((output));
    if (!valid) {
      return res.status(failedResponse).json({
        message: 'Invalid password'
      })
    }

    const userSchema = new User(output[0]);
    return res.status(successResponse).json({
      user: userSchema.toAuthJSON()
    })
  }).catch((err) => {
    return res.status(failedResponse).json({
      message: err
    })
  })
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

exports.updateUser = function (req, res) {
  if (!req.user) {
    return res.status(failedResponse).json({
      message: process.env.LOG_TOKEN_EXPIRED
    })
  }

  return new Promise((resolve, reject) => {
    // user must input password first
    // to update their data
    if (!req.body.password) {
      return reject('You must input your password to update your data');
    }

    const user = {};

    req.body.username
      ? user.username = req.body.username
      : null;

    req.body.email
      ? user.email = req.body.email
      : null;

    req.body.name
      ? user.name = req.body.name
      : null;

    req.body.age
      ? user.age = req.body.age
      : null;

    req.file
      ? user.photo = req.file.path
      : null;

    console.log(req.file);

    User.findById(req.user._id, function (err, user) {
      if (err) {
        return reject('Failed to get your data');
      }

      bcrypt.compare(req.body.password, user.password, function (err, valid) {
        if (err) {
          return reject('Failed to compare your password');
        }

        if (!valid) {
          return reject(process.env.LOG_FAILED_PASSWORD);
        }
      })
    });

    User.findByIdAndUpdate(req.user._id, user, function (err) {
      if (err) {
        return reject('Failed to get your data');
      }

      return resolve(user);
    })
  });
};

exports.deleteUser = function (req, res) {
  if (!req.user) {
    return res.status(failedResponse).json({
      message: process.env.LOG_TOKEN_EXPIRED
    })
  }

  User.findByIdAndRemove(req.user._id, function (err, user) {
    if (err) {
      return res.status(failedResponse).json({
        message: err
      })
    }

    res.status(successResponse).json({
      message: 'User deleted',
      user: user
    })
  })
};
