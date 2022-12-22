const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const errorController = require("./controllers/error");
const dotenv = require("dotenv");
dotenv.config();

// db
// const User = require("./models/user");

// Importing routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));

// Telling the folder which you want to give read access
app.use(express.static(path.join(__dirname, "public")));

// This middleware is to find the user and then we store it in user in our request
// This is just to extract userId and use it in all our app
// app.use((req, res, next) => {
//   User.findById("63a154107b37bc642b17cba3")
//     .then((user) => {
//       // Creating a object for user
//       req.user = new User(user.name, user.email, user.cart, user._id);
//       next();
//     })
//     .catch((err) => console.log(err));
// });

// To use them like calling a function
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use("/", errorController.get404);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.lfr5p.mongodb.net/${process.env.MONGODB_DEFAULT_DB}?retryWrites=true&w=majority`
  )
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
