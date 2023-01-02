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

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "SignUp",
    path: "/signup",
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  // fake login process
  // If we are doing like this, the session wont be knowing about the models schema so we cant able to interact with the database
  // If we see the user data in compass, we just have the data of user. Now for every new request, the session does not go ahead and fetch the
  // user with the help of mongoose, it fetches the data from mongodb, that is correct, but for that it uses the mongodb store and mongodb store
  // does not know about our mongoose models.
  // So we fetch only the data not the methods provided by mongoose
  User.findById("63a42c5810c419781a2f1d7a")
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      // to make sure the session was created as the request will take couple of sec to load
      req.session.save((err) => {
        console.log(err);
        res.redirect("/");
      });
    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
