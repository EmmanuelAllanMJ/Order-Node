const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const errorController = require("./controllers/error");
const mongoConnect = require("./util/database");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));

// Telling the folder which you want to give read access
app.use(express.static(path.join(__dirname, "public")));

// Importing routes
// const adminRoutes = require("./routes/admin");
// const shopRoutes = require("./routes/shop");

// To use them like calling a function
// app.use("/admin", adminRoutes);
// app.use(shopRoutes);

// app.use("/", errorController.get404);

mongoConnect((client) => {
  console.log(client);
  app.listen(3000);
});
