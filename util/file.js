const fs = require("fs");

exports.deleteFile = (filePath) => {
  //   deletes the name and the file
  fs.unlink(filePath, (err) => {
    if (err) {
      throw err;
    }
  });
};

// exports.deleteFile = deleteFile;
