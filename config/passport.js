const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user-model");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

passport.serializeUser((user, done) => {
  console.log(`Serializing user now`);
  done(null, user._id);
});

passport.deserializeUser((_id, done) => {
  console.log("Deserializing user now");
  User.findById(_id)
    .then((user) => {
      console.log("Found user:", user); // 確認找到了用戶
      done(null, user);
    })
    .catch((err) => {
      console.error("Error finding user:", err);
      done(err, null);
    });
});

passport.use(
  new LocalStrategy((username, password, done) => {
    console.log("Authenticating:", username);
    User.findOne({ email: username })
      .then((user) => {
        if (!user) {
          return done(null, false, {
            message: "Invalid username or password.",
          });
        }
        bcrypt.compare(password, user.password, function (err, result) {
          if (err) {
            console.error("Error comparing password:", err);
            return done(err);
          }
          if (!result) {
            return done(null, false, {
              message: "Invalid username or password.",
            });
          }
          return done(null, user);
        });
      })
      .catch((err) => {
        console.error("Database error", err);
        return done(null, false);
      });
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    (accessToken, refreshToken, profile, done) => {
      //passport callback
      console.log(profile);
      User.findOne({ googleID: profile.id })
        .then((foundUser) => {
          if (!foundUser) {
            new User({
              name: profile.displayName,
              googleID: profile.id,
              thumbnail: profile.photos[0].value,
              email: profile.emails[0].value,
            })
              .save()
              .then((newUser) => {
                console.log("New user created.");
                done(null, newUser);
              })
              .catch((err) => done(err));
          } else {
            console.log("User already exist.");
            done(null, foundUser);
          }
        })
        .catch((err) => done(err));
    }
  )
);
