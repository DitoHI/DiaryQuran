const passportJwt = require('passport-jwt');
const userController = require('../routes/api/user/userController');

const strategyInitializer = () => {
  const { ExtractJwt, Strategy } = passportJwt;

  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = process.env.SECRET;

  return new Strategy(opts, async (payload, done) => {
    const user = await userController.showMe(payload.id);
    return done(null, user);
  });
};

export { strategyInitializer };
