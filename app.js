const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

// controller
const errorController = require("./controllers/error");

// env
const dotenv = require("dotenv");
dotenv.config();

// db
const User = require("./models/user");

// Importing routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const mongoose = require("mongoose");
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.lfr5p.mongodb.net/${process.env.MONGODB_DEFAULT_DB}`;

const app = express();
// mongodbstore will yield a constructor where you can pass object
// uri - which db you need to store the data
// collection - compulsory, we can also set time to delete
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

// default settings, initializing csrf
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));

// Telling the folder which you want to give read access
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "my string",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
// using csrf middleware
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      // we are throwing error if there is any technical issue
      throw new Error(err);
    });
});

// after user middleware and before routes
app.use((req, res, next) => {
  // special field on the response, the local field, this allows us to set local variables that are passed into the views local
  // because there exist only in the views, for every request these two field will be set
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/500", errorController.get500);
app.use("/", errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
