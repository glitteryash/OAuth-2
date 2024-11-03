const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
  googleID: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  thumbnail: {
    type: String,
  },
  //Local Login
  email: {
    type: String,
  },
  password: {
    type: String,
    maxlength: 1024,
  },
});

module.exports = mongoose.model("User", userSchema);
