const express = require("express");
const path = require("path");
const shopController = require("../controllers/shop");

const router = express.Router();

// Get and post method would do an exact match
router.get("/", shopController.getIndex);
router.get("/products", shopController.getProducts);
// Order of the routes is important, so put the most important route first
router.get("/products/:productId", shopController.getProduct);
router.get("/cart", shopController.getCart);
router.post("/cart", shopController.postCart);
// router.post("/cart-delete-item", shopController.postCartDelete);
// router.get("/orders", shopController.getOrders);
// router.get("/checkout", shopController.getCheckout);

module.exports = router;
