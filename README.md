**Diary Qur'an**

### Introduction
This is the project of implementing backend server with Node.js. The use case is helping *user* to make a note of reading Al-Qur'an

### Dataset
Extract dataset from [quran-json](https://github.com/rioastamal/quran-json) by Rio Astamal. Implement ETL processing to be the collection with relational in NoSQL

### Road Maps
* CRUD of User with multiple endpoints to support **authentication**
* Create and Login user with authentication of **JWT**
* Upload image with **multer** and automatically delete it if the requirements of create/update user is not fulfilled
* ETL Processing using FileSystem to read data from json
* Get data and filter the value by using `regex`
* Populate with multiple collections. Collection of ayat have more than two references to another collections.
* Use `passport-jwt` in every route to integrate the CRUD on Ayat only if user has logged in

### Result of Bookmarked Qur'an
```json
{
  "ayat": {
    "ayatNumber": 2,
    "ayatTafsir": "Dalam ayat-ayat berikut ini, Allah memerintahkan kepada Nabi Muhammad dan seluruh kaum Muslimin supaya selalu berlindung kepada Tuhan Pencipta semua makhluk agar terpelihara dari segala macam kejahatan atau akibat kejahatan yang ditimbulkan oleh makhluk-makhluk yang telah diciptakan-Nya.",
    "ayatTranslation": "dari kejahatan (makhluk yang) Dia ciptakan,"
  },
  "surat": {
    "suratName": "الفلق",
    "suratNameLatin": "Al-Falaq",
    "suratNameTranslation": "Subuh",
    "suratNumber": 113
  },
  "message": "Success to add bookmark"
}
```
