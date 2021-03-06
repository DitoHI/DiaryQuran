const fs = require('fs');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Surat = mongoose.model('Surat');
const Ayat = mongoose.model('Ayat');
const AyatTranslation = mongoose.model('AyatTranslation');
const AyatTafsir = mongoose.model('AyatTafsir');

const successResponse = process.env.STATUS_CODE_SUCCESS;
const failedResponse = process.env.STATUS_CODE_FAILED;

const suratDir = process.env.SURAT_FILE_DIR;

exports.initializeDataset = function () {
  return new Promise((resolve, reject) => {
    fs.readdir(suratDir, (err, suratsFile) => {
      if (err) {
        return reject('error');
      }

      const surats = [];
      let i = 0
        , j = 0;
      suratsFile.forEach((suratUnClean) => {
        const suratUnCleanDir = `${suratDir}${suratUnClean}`;
        fs.readFile(suratUnCleanDir, 'utf8', function (errChild, suratClean) {
          if (errChild) {
            return reject('error');
          }

          // surat still in parent object
          const suratUnCleanObject = JSON.parse(suratClean);
          const keySuratObject = Object.keys(suratUnCleanObject)[0];

          // get clean object of surat
          const suratObject = suratUnCleanObject[keySuratObject];
          const suratTextObject = suratObject['text'];
          const suratTranslationObject = suratObject['translations']['id'];
          const suratTafsirObject = suratObject['tafsir']['id']['kemenag'];

          // add surat to database
          const surat = new Surat({
            _id: new mongoose.Types.ObjectId(),
            number: keySuratObject,
            name: suratObject.name,
            nameLatin: suratObject['name_latin'],
            nameTranslation: suratTranslationObject['name'],
            sourceTafsir: suratTafsirObject['source'],
            sumAyat: suratObject['number_of_ayah']
          });

          // loop through ayat
          for (var key in suratTextObject) {

            if (suratTextObject.hasOwnProperty(key)
              && suratTranslationObject['text'].hasOwnProperty(key)
              && suratTafsirObject['text'].hasOwnProperty(key)) {

              const ayat = new Ayat({
                surat: surat._id,
                _id: new mongoose.Types.ObjectId(),
                number: key,
                text: suratTextObject[key],
              });

              surat["ayat"].push(ayat._id);

              // save the translation and tafsir
              const ayatTranslation = new AyatTranslation({
                _id: new mongoose.Types.ObjectId(),
                ayat: ayat._id,
                text: suratTranslationObject['text'][key]
              });
              ayatTranslation.save(function (err) {
                if (err) {
                  return reject(err);
                }
              });

              const ayatTafsir = new AyatTafsir({
                _id: new mongoose.Types.ObjectId(),
                ayat: ayat._id,
                text: suratTafsirObject['text'][key]
              });
              ayatTafsir.save(function (err) {
                if (err) {
                  return reject(err);
                }
              });

              ayat["ayatTranslation"] = ayatTranslation._id;
              ayat["ayatTafsir"] = ayatTafsir._id;
              ayat.save(function (err) {
                if (err) {
                  return reject(err);
                }
                console.log(`${surat.nameLatin} of ayat ${ayat.number} saved[${j}]`);
                ++j;
              });
            }

          }

          surat.save(function (err) {
            if (err) {
              return reject(err);
            }
            console.log(`Surat ${surat.nameLatin} done`);
          });

          if (i === suratsFile.length - 1) {
            return resolve(
              `Successfully added ${suratsFile.length} surat`
            )
          }
          ++i;

        });
      });

      console.log(`Finished`);
    })
  })
};

exports.findSurat = function (req, res, next) {
  if (!req.body.suratNameLatin && !req.body.suratNumber && !req.body.suratNameTranslation) {
    return res.status(failedResponse).json({
      message: 'Please input the name, the number, or translation of name of surat'
    })
  }

  let surat = {};
  req.body.suratNameLatin
    ? surat.nameLatin = new RegExp(req.body.suratNameLatin, "i")
    : null;

  req.body.suratNumber
    ? surat.number = req.body.suratNumber
    : null;

  req.body.suratNameTranslation
    ? surat.nameTranslation = new RegExp(req.body.suratNameTranslation, "i")
    : null;

  Surat.find(surat).exec().then((output) => {
    if (output) {
      req.surats = output;
      next();
    }
  }).catch(err => {
    return res.status(failedResponse).json({
      message: err
    })
  })
};

exports.findAyatFromSurat = function (req, res, next) {
  if (req.surats.length === 0) {
    return res.status(failedResponse).json({
      message: 'Surat not found'
    })
  }

  if (req.surats.length > 1) {
    return res.status(failedResponse).json({
      message: `There are ${req.surats.length} surat from your searches. Please specify more the surat`
    })
  }

  if (!req.body.ayatNumber && !req.body.ayatTranslation && !req.body.ayatTafsir) {
    return res.status(failedResponse).json({
      message: 'Please input the number, translation, or tafsir of ayat'
    })
  }

  const surat = req.surats[0];

  let ayat = {};
  let ayatTranslation = {};
  let ayatTafsir = {};
  ayat.surat = surat._id;

  req.body.ayatNumber
    ? ayat.number = req.body.ayatNumber
    : null;

  req.body.ayatTranslation
    ? ayatTranslation.text = new RegExp(req.body.ayatTranslation, "i")
    : null;

  req.body.ayatTafsir
    ? ayatTafsir.text = new RegExp(req.body.ayatTafsir, "i")
    : null;

  Ayat.find(ayat)
    .populate({
      path: 'ayatTranslation',
      match: ayatTranslation
    })
    .populate({
      path: 'ayatTafsir',
      match: ayatTafsir
    })
    .exec()
    .then((output) => {
      //filter the null values of translation
      const cleanOutput = output.filter(function(out) {
        if (ayatTranslation && !ayatTafsir) {
          return out.ayatTranslation !== null
        }

        if (ayatTafsir && !ayatTranslation) {
          return out.ayatTafsir !== null
        }

        if (ayatTranslation && ayatTafsir) {
          return out.ayatTafsir !== null &&
            out.ayatTranslation
        }
      });

      if (cleanOutput.length === 0) {
        return res.status(failedResponse).json({
          message: 'Ayat not found'
        })
      }

      if (cleanOutput.length > 1) {
        return res.status(failedResponse).json({
          message: `There are ${cleanOutput.length} ayat from your searches. Please specify more the ayat`
        })
      }

      // update read status of user
      // to ayat
      let message = 'Success to add bookmark';
      Ayat.findById(cleanOutput[0]._id, function (err, ayat) {
        if (ayat.users.indexOf(req.user._id) > -1) {
          const indexOfPosition = ayat.users.indexOf(req.user._id);
          ayat.users.splice(indexOfPosition, 1);
        }

        // testing
        // ayat.users = [];
        ayat.users.push(user._id);
        ayat.save(function (err) {
          if (err) {
            return res.status(failedResponse).json({
              message: err
            })
          }
        });
      });

      const user = req.user;

      User.findById(user._id, function (err, user) {
        if (err) {
          return res.status(failedResponse).json({
            message: err
          })
        }

        user.ayat = cleanOutput[0]._id;
        user.save(function (err) {
          if (err) {
            return res.status(failedResponse).json({
              message: err
            })
          }

          req.ayats = {
            ayatNumber: cleanOutput[0].number,
            ayatTafsir: cleanOutput[0].ayatTafsir.text,
            ayatTranslation: cleanOutput[0].ayatTranslation.text,
          };

          next();
        })
      });
    }).catch((err) => {
    return res.status(failedResponse).json({
      message: err
    })
  })

};

exports.findAyatById = function (req, res, next) {
  User.findById(req.user._id, function (err, result) {
    if (err) {
      return res.status(failedResponse).json({
        message: 'Failed in finding user'
      })
    }

    if (!result.ayat) {
      return res.status(failedResponse).json({
        message: 'You haven\'t read any Qur\'an'
      });
    }

    Ayat.findById(result.ayat, function (err, ayat) {
      if (err) {
        return res.status(failedResponse).json({
          message: err
        })
      }

      req.ayats = ayat;
      next();
    })
  });
};

exports.deleteAyatFromUser = function (req, res) {
  // delete from ayat
  const ayatModified = JSON.parse(JSON.stringify(req.ayats));
  const indexRead = (ayatModified.users).indexOf((req.user._id).toString());
  if (indexRead === -1) {
    return res.status(failedResponse).json({
      message: 'There isn\'t any history related yours in this ayat'
    })
  }

  ayatModified.users.splice(indexRead, 1);
  Ayat.findByIdAndUpdate(ayatModified._id, ayatModified).then((result) => {

    // now delete from user
    const userModified = JSON.parse(JSON.stringify(req.user));
    userModified.ayat = null;
    const newUser = new User(userModified);
    User.findByIdAndUpdate(userModified._id, userModified).then(() => {
      return res.status(successResponse).json({
        user: newUser,
      })
    }).catch((err) => {
      return res.status(failedResponse).json({
        message: err
      })
    })

  }).catch((err) => {
    return res.status(failedResponse).json({
      message: err
    })
  })
};

exports.getReadFromUser = function (req, res, next) {
  // output
  // surat, ayats, ayatTranslation, ayatTafsir
  Ayat
    .findById(req.ayats._id)
    .populate('surat')
    .populate('ayatTranslation')
    .populate('ayatTafsir')
    .exec((err, ayat) => {
      if (err) {
        return res.status(failedResponse).json({
          message: err
        })
      }
      req.surat = ayat.surat;
      req.ayatTranslation = ayat.ayatTranslation;
      req.ayatTafsir = ayat.ayatTafsir;
      next();
    })
};
