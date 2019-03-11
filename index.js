const morgan = require('morgan'),
  mongoose = require('mongoose'),
  express = require('express'),
  app = express();

require('dotenv/config');

// use middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

// connect to mongoose
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise;
const db = mongoose.connection;

// check the connection
db.on('error', () => {
  console.log(`Mongodb connection error`);
});
db.once('open', () => {
  console.log(`Mongodb connected`);
});

// connect to routes and models
require('./models/User');
require('./models/Surat');
app.use(require('./routes'));

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
