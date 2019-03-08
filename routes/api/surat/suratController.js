const fs = require('fs');
const mongoose = require('mongoose');
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

exports.findAyat = function (req, res, next) {
  if (req.surats.length === 0) {
    return res.status(failedResponse).json({
      message: 'Surat not found'
    })
  }

  // if (!req.body.ayatNumber && !req.body.ayatTranslation && !req.body.ayatTafsir) {
  //   return res.status(failedResponse).json({
  //     message: 'Please input the number, translation, or tafsir of ayat'
  //   })
  // }

  const surat = req.surats[0];

  let ayat = {};
  ayat.surat = surat._id;

  req.body.ayatNumber
    ? ayat.number = req.body.ayatNumber
    : null;

  const ayatTranslation = req.body.ayatTranslation
    ? new RegExp(req.body.ayatTranslation, "i")
    : null;

  // req.body.ayatTafsir
  //   ? ayat.ayatTafsir = new RegExp(req.body.ayatTafsir, "i")
  //   : null;

  Ayat.find(ayat)
    .populate({
      path: 'ayatTranslation',
      match: {text: ayatTranslation}
    })
    .exec()
    .then((output) => {
      //filter the null values of translation
      const cleanOutput = output.filter(function(out) {
        return out.ayatTranslation !== null
      });

      if (cleanOutput.length === 0) {
        return res.status(failedResponse).json({
          message: 'Ayat not found'
        })
      }

      return res.status(successResponse).json({
        surat,
        ayat: cleanOutput
      })
    }).catch((err) => {
    return res.status(failedResponse).json({
      message: err
    })
  })

};
