exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: req.isLoggedIn,
  });
};
exports.postLogin = (req, res, next) => {
  // we are saving the user in req object
  req.isLoggedIn = true;
  // this wont work
  // this data does not stick around, the data is lost after this request or after we send response
  // the redirection creates brand new request, we are working with totally different request, becoz your page will be having hundreds of users
  //   and obviously the request of all the users are not related to each other, otherwise they could look into the data that shouldnt see and
  // even the request of a single user, so request from the same ip address are treated to be different independent request which is a good thing
  // we also cant use global variable as they would be shared across all the request and users,
  //   that's when we use cookies where we can store the data in a browser for a single user which is customized to that user which does not affect
  // all the users but can be sent with the requests hey i'm already authenticated
  res.redirect("/");
};
