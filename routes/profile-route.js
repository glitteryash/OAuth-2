const router = require("express").Router();
const Post = require("../models/post-model");

const authCheck = (req, res, next) => {
  console.log("Middleware Start - Original URL: ", req.originalUrl);
  console.log("Current Session Before Check: ", req.session);

  // 在每次未認證的請求中，強制設置和保存 returnTo
  if (!req.isAuthenticated() && req.originalUrl !== "/auth/login") {
    req.session.returnTo = req.originalUrl;

    // 立即保存 session
    req.session.save((err) => {
      if (err) {
        console.error("Session save error in authCheck:", err);
      }
      console.log("Saved returnTo in authCheck: ", req.session.returnTo);
      console.log("Session after saving returnTo: ", req.session);
    });
  }

  if (!req.isAuthenticated()) {
    res.redirect("/auth/login");
  } else {
    next();
  }
};

router.get("/", authCheck, async (req, res) => {
  let postFound = await Post.find({ author: req.user._id });
  res.render("profile", { user: req.user, posts: postFound });
});

router.get("/post", authCheck, (req, res) => {
  res.render("post", { user: req.user });
});

router.post("/post", authCheck, async (req, res) => {
  let { title, content } = req.body;
  let newPost = new Post({ title, content, author: req.user._id });
  try {
    await newPost.save();
    res.status(200).redirect("/profile");
  } catch (err) {
    req.flash("error_msg", "Both title and content are required.");
    res.redirect("/profile/post");
  }
});

module.exports = router;
