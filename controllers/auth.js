const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  //   const isLoggedIn =
  //     req.get("Cookie").split("=")[1].trim().split("%3D")[1] === "true";
  //   console.log(req.get("Cookie"), isLoggedIn);
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: false,
  });
};
exports.postLogin = (req, res, next) => {
  // fake login process
  User.findById("63a42c5810c419781a2f1d7a")
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};
