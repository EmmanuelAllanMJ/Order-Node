const { getDb } = require("../util/database");
const mongodb = require("mongodb");

module.exports = class Product {
  constructor(title, price, description, imageUrl, id) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new mongodb.ObjectId(id) : null;
  }

  save() {
    // Connecting with db
    const db = getDb();
    let dbOp;
    if (this._id) {
      // Update product
      // updateOne does not replaces the, instead we have to describe the operation
      dbOp = db
        .collection("products")
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOp = db.collection("products").insertOne(this);
    }
    return dbOp
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static fetchAll() {
    // find will return us a cursor which allows us to go through our elements
    const db = getDb();
    // We use toArray to get the data and convert it into json
    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        // console.log(products);
        return products;
      })
      .catch((err) => console.log(err));
  }

  static findById(prodId) {
    const db = getDb();
    // next will return the last document returned by the file, basically we will get a cursor when using find
    return db
      .collection("products")
      .findOne({ _id: new mongodb.ObjectId(prodId) })
      .then((product) => {
        console.log(product);
        return product;
      })
      .catch((err) => console.log(err));
  }

  static deleteById(prodId) {
    const db = getDb();
    return db
      .collection("products")
      .deleteOne({ _id: new mongodb.ObjectId(prodId) })
      .then((result) => {
        console.log("Deleted");
      })
      .catch((err) => {
        console.log("Deleted");
      });
  }
};
