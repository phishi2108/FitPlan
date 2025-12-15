require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/userSchema"); // Renamed for clarity (was addUser)

const auth = async (req, res, next) => {
  try {
    // 1. CHANGE: Look for token in the HEADERS, not cookies
    // The frontend sends it as 'x-auth-token'
    const token = req.header("x-auth-token");

    if (!token) {
      console.log("No token found in headers.");
      return res
        .status(401)
        .send({ message: "Access denied. No token provided." });
    }

    // 2. Verify the Token
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);

    // 3. Find the User
    const user = await User.findOne({ _id: verifyUser._id });

    if (!user) {
      return res
        .status(401)
        .send({ message: "User not found with this token." });
    }

    // 4. Attach User & Token to Request object
    req.token = token;
    req.user = user;
    next(); // Proceed to the next middleware/route
  } catch (error) {
    console.log("Auth Error:", error.message);
    res.status(401).send({ message: "Invalid Token" });
  }
};

module.exports = auth;
