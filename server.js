var createError = require("http-errors");
var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

var indexRouter = require("./routes/index");
var loginAuthRouter = require("./routes/auth/login");
var verifyAuthRouter = require("./routes/auth/verify-email");
var transactionsRouter = require("./routes/transactions");
var registerAuthRouter = require("./routes/auth/register");
var fogortPasswordAuthRouter = require("./routes/auth/forgot-password");
var usersRouter = require("./routes/users");

var app = express();
var PORT = process.env.PORT || 8080;

// Middleware setup
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// Routes setup
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", loginAuthRouter);
app.use("/auth", verifyAuthRouter);
app.use("/auth", registerAuthRouter);
app.use("/auth", fogortPasswordAuthRouter);
app.use("/transactions", transactionsRouter);

// Error handling
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.json({ message: err.message, error: err });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const mongoose = require('mongoose');

// Replace this with your MongoDB connection string
const uri = "mongodb+srv://raymondowen75:6GNlZ4NydYziMiSC@investorbkr0.izgb4.mongodb.net/?retryWrites=true&w=majority&appName=investorbkr0";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('Error connecting to MongoDB:', error));
