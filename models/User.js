const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');
const salt = parseInt(process.env.DEFAULT_SALT_ROUNDS);

const UserSchema = new mongoose.Schema({
  username: { type: String,  lowercase: true, unique: true, required: [true, 'can\'t be blank'] },
  email: { type: String,  lowercase: true, unique: true, required: [true, 'can\'t be blank'] },
  name: { type: String,  lowercase: true, required: [true, 'can\'t be blank'] },
  age: Number,
  password: String,
});

UserSchema.plugin(uniqueValidator, { message: 'is already taken' });

UserSchema.methods.setPassword = async function(password) {
  this.password = await bcrypt.hash(password, salt);
};

UserSchema.methods.generateJWT = function() {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000)
  }, process.env.SECRET);
};

UserSchema.methods.toAuthJSON = function() {
  return {
    username: this.username,
    email: this.email,
    name: this.name,
    age: this.age,
    token: this.generateJWT(),
  };
};

mongoose.model('User', UserSchema);
