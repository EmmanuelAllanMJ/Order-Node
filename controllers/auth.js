const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const User = require("../models/user");
// env
const dotenv = require("dotenv");
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
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: req.flash("error")[0],
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "SignUp",
    path: "/signup",
    errorMessage: req.flash("error")[0],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        // first - key, second - value
        req.flash("error", "Invalid email or password.");

        return res.redirect("/login");
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
          req.flash("error", "Invalid email or password.");

          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "Email already exist, please pick a different one.");

        return res.redirect("/signup");
      }
      // 12 is the number of hashing required and 12 is secured
      // this will return us a promise
      // nested then block, this makes logically correct
      return bcrypt
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
          console.log(err);
        });
    })

    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
