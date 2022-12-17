const mongodb = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const MongoClient = mongodb.MongoClient;

// We use underscore just to define it is stored internally
let _db;

MONGO_URL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.lfr5p.mongodb.net/${process.env.MONGODB_DEFAULT_DB}?retryWrites=true&w=majority`;

const mongoConnect = (callback) => {
  MongoClient.connect(MONGO_URL)
    .then((client) => {
      console.log("Connected");
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

// If the data base is successfully connected, this function will give access to it across the platform
const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
