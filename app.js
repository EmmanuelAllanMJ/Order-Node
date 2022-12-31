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

// To use them like calling a function
// config session setup
// secret - used for signing the hash which secretly stores our id there
// resave(false) - session will not be saved on every request that is done
// saveUninitialized(false) -ensure no session will be saved for a request where it doesnt need to be saved
// we can also config cookie
// in production it should be long string value
app.use(
  session({
    secret: "my string",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
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
