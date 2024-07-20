const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require('passport');

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET
};

passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    let email = jwt_payload.email;
    console.log(email);
    if (email) {
        return done(null, email);
    }
    return done(null, false);
}));
