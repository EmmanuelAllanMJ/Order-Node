const mongodb = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const MongoClient = mongodb.MongoClient;

MONGO_URL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.lfr5p.mongodb.net/?retryWrites=true&w=majority`;

const mongoConnect = (callback) => {
  MongoClient.connect(MONGO_URL)
    .then((result) => {
      console.log("Connected");
      callback(result);
    })
    .catch((err) => console.log(err));
};

module.exports = mongoConnect;
