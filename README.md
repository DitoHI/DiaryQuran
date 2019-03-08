**Diary Qur'an**

### Introduction
This is the project of implementing backend server with NPM. The use case is helping *user* to make a note of reading Al-Qur'an

### Dataset
Scraping of dataset from [quran-json](https://github.com/rioastamal/quran-json) by Rio Astamal. Implement ETL processing to be the collection with relational in NoSQL

### Features
* Create and Login user with authentication of JWT
* ETL Processing using FileSystem to read data from json

### Result of Bookmarked Qur'an
```json
{
  "ayatTafsir": "Ayat ini menerangkan bahwa Al-Qur‘an tidak dapat diragukan, karena ia wahyu Allah swt yang diturunkan kepada Nabi Muhammad saw Nabi yang terakhir dengan perantaraan Jibril a.s. :\n\nDan sungguh (Al-Qur‘an) ini benar-benar diturunkan oleh Tuhan seluruh alam, yang dibawa oleh ar-Ruh al-Amin (Jibril) (asy-Syu‘ara‘/26: 192-193).\n\nYang dimaksud “Al-Kitab” (wahyu) di sini ialah Al-Qur‘an. Disebut “Al-Kitab” sebagai isyarat bahwa Al-Qur‘an harus ditulis, karena itu Nabi Muhammad saw memerintahkan para sahabat menulis ayat-ayat Al-Qur‘an. \n\nAl-Qur‘an merupakan bimbingan bagi orang yang bertakwa, sehingga dia berbahagia hidup di dunia dan di akhirat nanti. Orang yang bertakwa ialah orang yang memelihara dan menjaga dirinya dari azab Allah dengan selalu melaksanakan perintah-perintah Allah dan menjauhi larangan-larangan-Nya. Di antara tanda-tanda orang yang bertakwa ialah sebagaimana yang tersebut pada ayat-ayat berikut:",
  "ayatTranslation": "Kitab (Al-Qur'an) ini tidak ada keraguan padanya; petunjuk bagi mereka yang bertakwa,",
  "message": "Success to add bookmark",
  "surat": "Al-Baqarah"
}
```
