const express = require("express");
const path = require("path");
const adminController = require("../controllers/admin");
const { body } = require("express-validator");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

// we can give any number of handler we want, and this will be parsed from left to right
router.get("/add-product", isAuth, adminController.getAddProduct);
router.get("/products", isAuth, adminController.getProducts);

router.post(
  "/add-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("imageUrl").isURL(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 200 }).trim(),
  ],
  isAuth,
  adminController.postAddProduct
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("imageUrl").isURL(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 200 }).trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
