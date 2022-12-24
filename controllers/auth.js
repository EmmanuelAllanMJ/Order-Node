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
  //   setting cookie and time
  res.setHeader("Set-Cookie", "loggedIn=true; Max-Age=10");

  res.redirect("/");
};
