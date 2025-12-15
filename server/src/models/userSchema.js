require("dotenv").config();
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Changed 'mail' to 'email' for standard convention
    email: {
      type: String,
      required: true,
      unique: true, // CRITICAL: Prevent duplicate accounts
    },
    password: {
      type: String,
      required: true,
    },
    confirmpassword: {
      type: String,
      // required: true,
    },
    // NEW: Role for Trainer vs User logic
    role: {
      type: String,
      enum: ["user", "trainer"],
      default: "user",
    },
    // NEW: Who this user follows (for the Personalized Feed)
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // References this same model
      },
    ],
    // NEW: Which plans they have bought (Access Control)
    purchasedPlans: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan", // Will reference your Plan model
      },
    ],
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// GENERATE AUTH TOKEN
userSchema.methods.generateAuthToken = async function () {
  try {
    // Include the ROLE in the token payload so frontend knows user permissions immediately
    const token = await jwt.sign(
      { _id: this._id.toString(), role: this.role },
      process.env.SECRET_KEY
    );
    this.tokens = this.tokens.concat({ token });
    await this.save();
    return token;
  } catch (error) {
    console.log("Error occurred while generating token");
    console.log(error);
  }
};

// PASSWORD HASHING
userSchema.pre("save", async function (next) {
  // Only hash if the password was modified
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // NOTE: 'confirmpassword' is removed.
  // Validation for matching passwords should happen in your Controller/Frontend,
  // NOT in the database. You never want to store the confirmation.

  next();
});

// Use "User" (PascalCase) is standard convention for Model names
const User = mongoose.model("User", userSchema);

module.exports = User;
