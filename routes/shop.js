const express = require("express");
const path = require("path");
const shopController = require("../controllers/shop");

const router = express.Router();

// Get and post method would do an exact match
router.get("/", shopController.getIndex);
router.get("/products", shopController.getProducts);
router.get("/cart", shopController.getCart);
router.get("/checkout", shopController.getCheckout);

module.exports = router;
