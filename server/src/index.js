require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const port = process.env.PORT || 3000;
const auth = require("./middleware/auth.js");
require("./db/connections.js");

const allowedOrigins = [
  "https://airosphere.vercel.app",
  "http://localhost:5173",
];

const corsOptionss = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET, POST, PUT, DELETE, HEAD",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  next();
});

app.use(cors(corsOptionss));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Importing routes
const userRouter = require("./routes/userroute.js");
const authenticateroute = require("./routes/authenticateroute.js");
const planroute = require("./routes/planroute.js");

// Configuring routes
app.use("/user", userRouter);
app.use("/authenticate", authenticateroute);
app.use("/plan", planroute);

app.get("/", (req, res) => {
  res.send("server is liveeee");
});

app.listen(port, (req, res) => {
  console.log(`Server is running at port ${port}`);
});
