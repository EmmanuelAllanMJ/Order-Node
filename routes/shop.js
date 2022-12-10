const express = require("express");
const path = require("path");
const productsController = require("../controllers/products");

const router = express.Router();

// Get and post method would do an exact match
router.get("/", productsController.getProducts);

module.exports = router;
