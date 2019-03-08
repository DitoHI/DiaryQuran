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
      let i = 0;
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
            name: suratObject.name,
            nameLatin: suratObject['name_latin'],
            nameTranslation: suratTranslationObject['name'],
            sourceTafsir: suratTafsirObject['source'],
            sumAyat: suratObject['number_of_ayah']
          });

          surat.save().then(function () {
            // loop through ayat
            for (var key in suratTextObject) {
              if (suratTextObject.hasOwnProperty(key)
                && suratTranslationObject['text'].hasOwnProperty(key)
                && suratTafsirObject['text'].hasOwnProperty(key)) {
                const ayat = new Ayat({
                  surat: surat._id,
                  _id: new mongoose.Types.ObjectId(),
                  text: suratTextObject[key],
                });
                surat["ayat"].push(ayat._id);
                surat.save(function (err) {
                  return reject(err);
                });

                ayat.save(function (err) {
                  if (err) {
                    return reject(err);
                  }

                  // save the translation and tafsir
                  const ayatTranslation = new AyatTranslation({
                    ayat: ayat._id,
                    text: suratTranslationObject['text'][key]
                  });
                  ayatTranslation.save(function (err) {
                    return reject(err);
                  });
                  const ayatTafsir = new AyatTafsir({
                    ayat: ayat._id,
                    text: suratTafsirObject['text'][key]
                  });
                  ayatTafsir.save(function (err) {
                    return reject(err);
                  });
                });
              }
            }

          }).then(function () {
            console.log('Surat saved');
          }, function (err) {
            return reject(err);
          });

          if (i === suratsFile.length - 1) {
            return resolve(
              `Successfully added ${suratsFile.length} surat`
            )
          }
          ++i;

        });
      });
    })
  })
};

exports.addSurat = function (req) {
  const user = req.user;
};
