const mongoose = require("mongoose");

// Here we are using Schema constructor which allows us to create new schema
const Schema = mongoose.Schema;
// data schema or blueprint
// We can also deviate from this schema
const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  // ref -which other mongoose model has related to the data in that field
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// model is a function we are calling which is important for mongoose behind the scenes to connect a schema with a name, here the name is Product
// Mongoose will create a collection with plural name of the schema ie products
module.exports = mongoose.model("Product", productSchema);

// const { getDb } = require("../util/database");
// const mongodb = require("mongodb");

// module.exports = class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }

//   save() {
//     // Connecting with db
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       // Update product
//       // updateOne does not replaces the, instead we have to describe the operation
//       dbOp = db
//         .collection("products")
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbOp = db.collection("products").insertOne(this);
//     }
//     return dbOp
//       .then((result) => {
//         console.log(result);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static fetchAll() {
//     // find will return us a cursor which allows us to go through our elements
//     const db = getDb();
//     // We use toArray to get the data and convert it into json
//     return db
//       .collection("products")
//       .find()
//       .toArray()
//       .then((products) => {
//         // console.log(products);
//         return products;
//       })
//       .catch((err) => console.log(err));
//   }

//   static findById(prodId) {
//     const db = getDb();
//     // next will return the last document returned by the file, basically we will get a cursor when using find
//     return db
//       .collection("products")
//       .findOne({ _id: new mongodb.ObjectId(prodId) })
//       .then((product) => {
//         console.log(product);
//         return product;
//       })
//       .catch((err) => console.log(err));
//   }

//   static deleteById(prodId) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .deleteOne({ _id: new mongodb.ObjectId(prodId) })
//       .then((result) => {
//         console.log("Deleted");
//       })
//       .catch((err) => {
//         console.log("Deleted");
//       });
//   }
// };
