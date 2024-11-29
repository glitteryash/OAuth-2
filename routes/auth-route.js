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
  if (emailExist) {
    req.flash("error_msg", "Email has already been registered.");
    return res.redirect("/auth/signup");
  }

  const hash = await bcrypt.hash(password, 10);
  password = hash;
  let newUser = new User({ name, email, password });
  try {
    await newUser.save();
    req.flash("success_msg", "Registration succeeds. You can login now.");
    res.redirect("/auth/login");
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: "Internal server error" });
  }
});

router.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: true,
  }),
  (req, res) => {
    console.log("Login Successful");
    console.log("Full Session before redirect: ", req.session);

    // 儲存 returnTo 到 session，然後刪除它以避免後續操作時再次被覆蓋
    const returnTo = req.session.returnTo;
    delete req.session.returnTo;

    // 確保 session 儲存
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.redirect("/profile");
      }

      // 只有在 returnTo 存在的情況下才重定向
      const returnTo = req.session.returnTo;
      delete req.session.returnTo; // 完成後清理 returnTo

      if (returnTo) {
        console.log(`Redirecting to: ${returnTo}`);
        res.redirect(returnTo);
      } else {
        // 如果 returnTo 不存在，可以選擇不進行重定向，或顯示一個預設頁面
        console.log("No returnTo, redirect to the homepage.");
        res.redirect("/"); // 可以修改為其他您想要的頁面
      }
    });
  }
);

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
    scope: ["profile", "email"],
  })
);
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  if (req.session.returnTo) {
    let newPath = req.session.returnTo;
    req.session.returnTo = "";
    res.redirect(newPath);
  } else {
    res.redirect("/profile");
  }
});

module.exports = router;
