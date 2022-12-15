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
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

// Export as next gen js using class, we can also use es6
module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = +price;
  }

  // function without function keyword
  save() {
    getProductsFromFile((products) => {
      if (this.id) {
        const existingProductIndex = products.findIndex(
          (prod) => +prod.id === +this.id
        );

        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        console.log(updatedProducts);

        fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
          console.log(err);
        });
      } else {
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), (err) => {
          console.log(err);
        });
      }
    });
  }
  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile((products) => {
      const product = products.find((p) => p.id === id);
      // sync code
      cb(product);
    });
  }
};
