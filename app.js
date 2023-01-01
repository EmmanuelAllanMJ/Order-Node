const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const session = require("express-session");
// this will give a fn to execute where we will give session is passed to a fn which is yielded by requiring connect mongodb session and
// the result of that fn call is stored in mongodb store
const MongoDBStore = require("connect-mongodb-session")(session);

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
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then((user) => {
      // sessions here will be managed for us automatically and for every incoming request we register the middleware,
      // middleware will look for a session cookie, if it finds one it will look for fitting session in the db and load data from there
      // Now we will have the session data to load our real user to create our mongoose user model
      // We will be creating a user based on data stored in the session, so data that persists across the request, which will only live for
      // that request but it's fueled by data from the session and therefore it survives across the request
      // we are access the user data and save it in req
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/", errorController.get404);

mongoose
  .connect(MONGODB_URI)
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
