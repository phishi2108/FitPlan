const express = require("express");
const addUser = require("../models/userSchema");
const bcrypt = require("bcrypt");
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

router.get("/", auth, (req, res) => {
  res.status(200).send(req.user);
  return;
});

router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find User
    const user = await addUser.findOne({ email });
    if (!user) return res.status(400).send("Invalid Credentials");

    // 2. Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid Credentials");

    // 3. Generate Token
    const token = await user.generateAuthToken();

    // 4. Send Clean Response (Token + User Data)
    // We send token explicitly so frontend can grab it easily
    res.send({
      token: token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    // console.log("dkfsa");
    const token = req.cookies.jwt;
    if (token) {
      req.user.tokens = [];
      res.clearCookie("jwt", {
        // domain: "ggitsstudentsapi.vercel.app",
        sameSite: "none",
        secure: true,
        path: "/",
      });
      await req.user.save();
      res.status(200).send("logout successfull");
      return;
    }
  } catch (error) {
    // console.log("user not logged in");
    res.status(401).send("User not logged in.");
    return;
  }
});

module.exports = router;
