const express = require("express");
const router = express.Router();
const userRegister = require("../models/userSchema");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");

router.get("/getcurruser", auth, async (req, res) => {
  res.status(200).send(req.user);
  return;
});

//NEW USER STUDENTS
router.post("/adduser", async (req, res) => {
  try {
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;

    if (password === confirmpassword) {
      const newUser = new userRegister({
        password: req.body.password,
        // REMOVED: confirmpassword (don't save this to DB)
        name: req.body.name,
        email: req.body.email, // <--- CHANGED from 'mail' to 'email'
        role: req.body.role || "user", // Optional: Handle role
      });

      // Check using 'email'
      const isRegistered = await userRegister.findOne({
        email: req.body.email, // <--- CHANGED from 'mail' to 'email'
      });

      if (isRegistered) {
        res.status(409).send("User already exists");
        return;
      }

      const registered = await newUser.save();
      // Generate token immediately after save
      const token = await registered.generateAuthToken();

      res.status(200).send({ user: registered, token: token });
    } else {
      res.status(400).send("Password does not match");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error occurred while adding user: " + error.message);
  }
});

router.put("/follow/:trainerId", auth, async (req, res) => {
  try {
    const trainerId = req.params.trainerId;
    const userId = req.user._id;

    // Prevent user from following themselves
    if (trainerId === userId.toString()) {
      return res.status(400).send("You cannot follow yourself.");
    }

    // specific check to see if trainer exists could go here

    // Add trainerId to the 'following' array if not already present ($addToSet)
    const updatedUser = await userRegister.findByIdAndUpdate(
      userId,
      { $addToSet: { following: trainerId } }, // $addToSet prevents duplicates
      { new: true }
    );

    res.status(200).json({
      message: "Followed successfully",
      following: updatedUser.following,
    });
  } catch (error) {
    res.status(500).send("Error following trainer: " + error.message);
  }
});

// ---------------------------------------------------------
// 2. UNFOLLOW A TRAINER
// ---------------------------------------------------------
router.put("/unfollow/:trainerId", auth, async (req, res) => {
  try {
    const trainerId = req.params.trainerId;
    const userId = req.user._id;

    // Remove trainerId from the 'following' array ($pull)
    const updatedUser = await userRegister.findByIdAndUpdate(
      userId,
      { $pull: { following: trainerId } },
      { new: true }
    );

    res.status(200).json({
      message: "Unfollowed successfully",
      following: updatedUser.following,
    });
  } catch (error) {
    res.status(500).send("Error unfollowing trainer: " + error.message);
  }
});

// ---------------------------------------------------------
// 3. VIEW LIST OF FOLLOWED TRAINERS
// ---------------------------------------------------------
router.get("/following", auth, async (req, res) => {
  try {
    // 1. Find the current user
    // 2. .populate("following") will replace the IDs in the array with actual User objects
    // 3. Select "name" and "mail" so we don't send back their passwords!
    const user = await userRegister.findById(req.user._id).populate({
      path: "following",
      select: "name mail role",
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Return just the list of people they follow
    res.status(200).json(user.following);
  } catch (error) {
    res.status(500).send("Error fetching following list: " + error.message);
  }
});

module.exports = router;
