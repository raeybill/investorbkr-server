const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware setup
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
const indexRouter = require("./routes/index");
const loginAuthRouter = require("./routes/auth/login");
const verifyAuthRouter = require("./routes/auth/verify-email");
const transactionsRouter = require("./routes/transactions");
const registerAuthRouter = require("./routes/auth/register");
const forgotPasswordAuthRouter = require("./routes/auth/forgot-password");
const usersRouter = require("./routes/users");

// Route setup
app.use("/", indexRouter);
app.use("/auth", loginAuthRouter);
app.use("/auth", verifyAuthRouter);
app.use("/auth", registerAuthRouter);
app.use("/auth", forgotPasswordAuthRouter);
app.use("/transactions", transactionsRouter);
app.use("/users", usersRouter);

// Error handling
app.use((req, res, next) => {
  next(createError(404, "The requested resource was not found."));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: req.app.get("env") === "development" ? err : {},
  });
});

// MongoDB connection
const uri = process.env.MONGODB_URI;

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
