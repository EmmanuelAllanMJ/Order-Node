const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const errorController = require("./controllers/error");

// db
const { mongoConnect } = require("./util/database");

// Importing routes
const adminRoutes = require("./routes/admin");
// const shopRoutes = require("./routes/shop");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));

// Telling the folder which you want to give read access
app.use(express.static(path.join(__dirname, "public")));

// To use them like calling a function
app.use("/admin", adminRoutes);
// app.use(shopRoutes);

app.use("/", errorController.get404);

mongoConnect(() => {
  app.listen(3000);
});
