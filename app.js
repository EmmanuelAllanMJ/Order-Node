const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const helmet = require("helmet");
const compression = require("compression");

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
const MONGODB_URI = process.env.DATABASE_URL;

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

// config option for file storage
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // if null means no error
    // images is where we need to store
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  }
  cb(null, false);
};

app.set("view engine", "ejs");
app.set("views", "views");
// this urlencoder can only accept data as text, not file as file is binary data
app.use(bodyParser.urlencoded({ extended: false }));
// for single file, the file field name is image
// image will be saved in /images folder
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(helmet());
app.use(compression());

// Telling the folder which you want to give read access, they are considered as root folder
app.use(express.static(path.join(__dirname, "public")));
// here /images will be considered as static folder
app.use("/images", express.static(path.join(__dirname, "images")));

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

// after user middleware and before routes
app.use((req, res, next) => {
  // special field on the response, the local field, this allows us to set local variables that are passed into the views local
  // because there exist only in the views, for every request these two field will be set
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  // throw new Error("Sync Dummy");
  User.findById(req.session.user._id)
    .then((user) => {
      // throw new Error("Dummy");
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      // we are throwing error if there is any technical issue, and this will not reach the express error handling middleware
      // ṭhere can be problem regarding infinite loop if we throw error outside
      // throw new Error(err);

      // instead of using async code snippet we wrap the error to next
      // Express executes middleware (anything that uses app.use())from top to bottom as it is defined in our app.js file.
      // If we call next(error) in our route, then it'll send the error to the next piece of middleware that expects error as an argument
      next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/500", errorController.get500);
app.use(errorController.get404);

// this is a special middleware where when we call next(error) it will skip all the middleware and move to this
// if we have more error middleware, then they will execute from top to bottom
app.use((error, req, res, next) => {
  // res.status(error.httpStatus).render();
  // res.redirect("/500");
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
