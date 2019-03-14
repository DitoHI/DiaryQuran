const morgan = require('morgan'),
  mongoose = require('mongoose'),
  express = require('express'),
  app = express(),
  passport = require('passport');

require('dotenv/config');

// use middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));

// connect to routes and models
require('./models/User');
require('./models/Surat');

// define passport
const {strategyInitializer} = require('./config/strategyInitializer');
passport.use(strategyInitializer());
passport.initialize();
app.use('/', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user) => {
    if (!user) {
      const failedResponse = process.env.STATUS_CODE_FAILED;
      return res.status(failedResponse).json({
        message: 'Token expired. Please log in first!'
      })
    }

    if (user) {
      req.user = user;
    }

    next();
  })(req, res, next);
});
app.use(require('./routes'));

// connect to mongoose
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});
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

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
