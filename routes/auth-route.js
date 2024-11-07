const router = require("express").Router();
const passport = require("passport");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");

router.get("/signup", (req, res) => {
  res.render("signup", { user: req.user });
});

router.post("/signup", async (req, res) => {
  let { name, email, password } = req.body;
  //check if the data is already exists in the db
  const emailExist = await User.findOne({ email });
  if (emailExist) return res.status(400).send("Email already exist.");

  const hash = await bcrypt.hash(password, 10);
  password = hash;
  let newUser = new User({ name, email, password });
  try {
    const savedUser = await newUser.save();
    res.status(201).send({
      msg: "User created",
      saveObj: savedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: "Internal server error" });
  }
});

router.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile"],
  })
);
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  res.redirect("/profile");
});

module.exports = router;
