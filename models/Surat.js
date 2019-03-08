const mongoose = require('mongoose');
const User = mongoose.model('User');
const uniqueValidator = require('mongoose-unique-validator');

const SuratSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  number: {
    type: Number, required: [true, 'can\'t be blank'], unique: true,
  },
  name: {
    type: String, required: [true, 'can\'t be blank'], unique: true,
  },
  nameLatin: {
    type: String, required: [true, 'can\'t be blank'], unique: true,
  },
  nameTranslation: {
    type: String, required: [true, 'can\'t be blank'], unique: true,
  },
  sourceTafsir: {
    type: String, required: [true, 'can\'t be blank'],
  },
  sumAyat: Number,
  ayat: [{type: mongoose.Schema.Types.ObjectId, ref: 'Ayat'}],
});

SuratSchema.plugin(uniqueValidator, {message: 'is already taken'});

const AyatSchema = new mongoose.Schema({
  surat: {type: mongoose.Schema.Types.ObjectId, ref: 'Surat'},
  users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  _id: mongoose.Schema.Types.ObjectId,
  text: {
    type: String, required: [true, 'can\'t be blank'],
  },
  number: {
    type: Number, required: [true, 'can\'t be blank'], unique: true,
  },
  ayatTranslation: {type: mongoose.Schema.Types.ObjectId, ref: 'AyatTranslation'},
  ayatTafsir: {type: mongoose.Schema.Types.ObjectId, ref: 'AyatTafsir'}
});

const AyatTranslationSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  ayat: {type: mongoose.Schema.Types.ObjectId, ref: 'Ayat'},
  text: {
    type: String, required: [true, 'can\'t be blank'],
  },
});

const AyatTafsirSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  ayat: {type: mongoose.Schema.Types.ObjectId, ref: 'Ayat'},
  text: {
    type: String, required: [true, 'can\'t be blank'],
  },
});

mongoose.model('Surat', SuratSchema);
mongoose.model('Ayat', AyatSchema);
mongoose.model('AyatTranslation', AyatTranslationSchema);
mongoose.model('AyatTafsir', AyatTafsirSchema);
