const fs = require("fs");
const path = require("path");

// global helper constant
const p = path.join(
  path.dirname(require.main.filename),
  "data",
  "products.json"
);
// Refactoring code
const getProductsFromFile = (cb) => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      return cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};
// Export as next gen js using class, we can also use es6
module.exports = class Product {
  constructor(title, imageURL, description, price) {
    this.title = title;
    this.imageURL = imageURL;
    this.description = description;
    this.price = price;
  }

  // function without function keyword
  save() {
    getProductsFromFile((products) => {
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), (err) => {
        console.log(err);
      });
    });
  }
  static fetchAll(cb) {
    getProductsFromFile(cb);
  }
};
