const express = require("express");
const { check, body } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

// validator is required for post route
// check() will return a middleware
router.post("/login", authController.postLogin);
// to check for a specific email, we use custom
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        //   adding our own async validation, as reaching out to db is not instant task and express-validator has to wait for it
        // if we return a promise becoz every then block returns a new promise, then express-validator will wait for this promise to be fulfilled
        //   if this returns nothing, then it has no error, if it resolves rejection, and this will stored as error
        return User.findOne({ email: value }).then((userDoc) => {
          // promise is a builtin js object and reject will basically throw an error inside the promise and we reject with an error
          return Promise.reject(
            "Email already exist, please pick a different one."
          );
        });
      }),
    //  we are checking the password in the body of the request not considering the header
    //   if we have same error message for different checks, we give the error msg inside the brackets
    body(
      "password",
      "Please enter a password with only numbers and text and atleast 5 characters"
    ).isLength({ min: 5 }),
    body("confirmPassword").custom((value, { req }) => {
      if (value != req.body.password) {
        throw new Error("Password have to match!");
      }
      return true;
    }),
  ],
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
