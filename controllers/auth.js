const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
// this gives us all the errors which prior middleware might have stored
const { validationResult } = require("express-validator");

const User = require("../models/user");
// env
const dotenv = require("dotenv");
const user = require("../models/user");
dotenv.config();

// for nodemailer, configuring transporter
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: `pixiemj00@gmail.com`,
    pass: `${process.env.MAIL_PWD}`,
  },
});

exports.getLogin = (req, res, next) => {
  //   const isLoggedIn =
  //     req.get("Cookie").split("=")[1].trim().split("%3D")[1] === "true";
  //   console.log(req.get("Cookie"), isLoggedIn);
  res
    .render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      errorMessage: req.flash("error")[0],
      validationErrors: [],
      oldInput: { email: "", password: "" },
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getSignup = (req, res, next) => {
  res
    .render("auth/signup", {
      pageTitle: "SignUp",
      path: "/signup",
      errorMessage: req.flash("error")[0],
      oldInput: { email: "", password: "", confirmPassword: "" },
      validationErrors: [],
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      oldInput: { email, password },
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        // first - key, second - value
        // req.flash("error", "Invalid email or password.");

        return res.status(422).render("auth/login", {
          pageTitle: "Login",
          path: "/login",
          errorMessage: "Invalid email or password",
          validationErrors: [],
          oldInput: { email, password },
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          // the password is matching or non matching we get into then block
          // we get a bool
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            // to make sure the session was created as the request will take couple of sec to load
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }
          // req.flash("error", "Invalid email or password.");
          return res.status(422).render("auth/login", {
            pageTitle: "Login",
            path: "/login",
            errorMessage: "Invalid email or password.",
            validationErrors: [],
            oldInput: { email, password },
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  // to retrieve validation result fn will go through that errors object managed by that middleware on the request and will then collect them all
  // in this error constant and we can use that constant, using that constant we can check for the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log(errors.array());
    // 422 - validation failed status code
    return res.status(422).render("auth/signup", {
      pageTitle: "SignUp",
      path: "/signup",
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password, confirmPassword },
      validationErrors: errors.array(),
    });
  }

  // 12 is the number of hashing required and 12 is secured
  // this will return us a promise
  // nested then block, this makes logically correct
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
      // configuring email to be sent
      const htmlContent = `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Document</title>
              <style>
                body{
                text-align:center;
            }
            img{
              width:50%;
              height:50%;

            }
            h1{
              color:#00695c;
                
            }
            a {
              background-color: #00695c;
              color: white;
              padding: 1em 1.5em;
              text-decoration: none;
              text-transform: uppercase;
              border-radius:50px;
            }

            a:hover {
              background-color: #555;
            }

            a:active {
              background-color: black;
            }

            a:visited {
              background-color: #ccc;
            }
              </style>
            </head>
            <body>
              <img src='https://d1oco4z2z1fhwp.cloudfront.net/templates/default/326/illo_welcome_1.png' alt='welcome'/>
              <h1>Welcome user</h1>
              <p>Thanks for signing up for our updates. We’ll be sending an occasional email with everything new and good that you’ll probably want to know about: new products, posts, promos, and parties.</p>
              <a href="http://localhost:3000/">Start Shopping</a>
            </body>
            </html>`;
      const msg = {
        to: email,
        from: `pixiemj00@gmail.com`,
        subject: "Signup successfully",
        text: "Signup successfully",
        html: htmlContent,
      };
      //send the email
      transporter.sendMail(msg, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    pageTitle: "Reset Password",
    path: "/reset",
    errorMessage: req.flash("error")[0],
  });
};
exports.postReset = (req, res, next) => {
  // 32 random bytes, this gives us a callback
  crypto.randomBytes(32, (err, buff) => {
    if (err) {
      console.log(err);
      return res.redirect("/");
    }
    // creating token
    const token = buff.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with the email is found.");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        const htmlContent = `
            <!doctype html>
            <html lang="en-US">

            <head>
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                <title>Reset Password Email Template</title>
                <meta name="description" content="Reset Password Email Template.">
                <style type="text/css">
                    a:hover {text-decoration: underline !important;}
                </style>
            </head>

            <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
                <!--100% body table-->
                <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                    style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                    <tr>
                        <td>
                            <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                                align="center" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="height:80px;">&nbsp;</td>
                                </tr>
                                
                                <tr>
                                    <td style="height:20px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td>
                                        <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                            style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                            <tr>
                                                <td style="height:40px;">&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:0 35px;">
                                                    <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                                        requested to reset your password</h1>
                                                    <span
                                                        style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                    <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                        We cannot simply send you your old password. A unique link to reset your
                                                        password has been generated for you. To reset your password, click the
                                                        following link and follow the instructions.
                                                    </p>
                                                    <a href="http://localhost:3000/reset/${token}"
                                                        style="background:#00695c;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                                        Password</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="height:40px;">&nbsp;</td>
                                            </tr>
                                        </table>
                                    </td>
                                <tr>
                                    <td style="height:20px;">&nbsp;</td>
                                </tr>
                              
                                <tr>
                                    <td style="height:80px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <!--/100% body table-->
            </body>

            </html>`;
        const msg = {
          to: req.body.email,
          from: `pixiemj00@gmail.com`,
          subject: "Password Reset",
          html: htmlContent,
        };
        //send the email
        transporter.sendMail(msg, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      res.render("auth/new-password", {
        pageTitle: "New Password",
        path: "/new-password",
        errorMessage: req.flash("error")[0],
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
