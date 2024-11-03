const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user-model");

passport.serializeUser((user, done) => {
  console.log(`Serializaing user now`);
  done(null, user._id);
});

passport.deserializeUser((_id, done) => {
  console.log("Deserializing user now");
  User.findById({ _id }).then((user) => {
    console.log("Found user");
    done(null, user);
  });
});

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
