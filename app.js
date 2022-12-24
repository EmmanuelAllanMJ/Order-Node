const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const errorController = require("./controllers/error");
const dotenv = require("dotenv");
dotenv.config();

// db
const User = require("./models/user");

// Importing routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));

// Telling the folder which you want to give read access
app.use(express.static(path.join(__dirname, "public")));

// This middleware is to find the user and then we store it in user in our request
// This is just to extract userId and use it in all our app
app.use((req, res, next) => {
  User.findById("63a42c5810c419781a2f1d7a")
    .then((user) => {
      // Creating a object for user
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

// To use them like calling a function
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/", errorController.get404);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.lfr5p.mongodb.net/${process.env.MONGODB_DEFAULT_DB}?retryWrites=true&w=majority`
  )
  .then((result) => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Allan",
          email: "allan@test.com",
          cart: { items: [] },
        });
        user.save();
      }
    });
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
