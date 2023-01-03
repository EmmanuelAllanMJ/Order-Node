const express = require("express");
const { check, body } = require("express-validator");

const authController = require("../controllers/auth");

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
        if (value === "test@test.com") {
          throw new Error("This email is forbidden");
        }
        return true;
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
