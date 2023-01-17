const { validationResult } = require("express-validator");
const fileHelper = require("../util/file");

const Product = require("../models/Product");
const User = require("../models/user");

exports.getAddProduct = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  res.render("admin/edit-product", {
    pageTitle: "Add product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  if (!image) {
    res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      hasError: true,
      product: { title, price, description },
      errorMessage: "Attached file is not an image",
      validationErrors: [],
    });
  }
  const imageUrl = image.path;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      hasError: true,
      product: { title, imageUrl, price, description },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  // instead of giving req.user._id we can give req.user which would save the entire user object and mongoose will just pick the id
  const product = new Product({
    title,
    imageUrl,
    price,
    description,
    userId: req.user,
  });

  // the save method is coming from mongoose
  product
    .save()
    .then((result) => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      // return res.status(500).render("admin/edit-product", {
      //   pageTitle: "Add Product",
      //   path: "/admin/edit-product",
      //   editing: false,
      //   hasError: true,
      //   product: { title, imageUrl, price, description },
      //   errorMessage: "Database operation failed, Please try again later",
      //   validationErrors: [],
      // });
      // res.redirect("/500");

      // creating a error object
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.getEditProduct = (req, res, next) => {
  // Query params are query after ? in the address, used to add optional info
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId).then((product) => {
    if (!product) {
      return res.redirect("/");
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const {
    productId: prodId,
    title: updatedTitle,
    price: updatedPrice,
    description: updatedDesc,
  } = req.body;
  image = req.file;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        productId: prodId,
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        // as this will return a promise, we will include nested then
        return res.redirect("/");
      }
      product.title = updatedTitle.trim();
      product.price = updatedPrice.trim();
      product.description = updatedDesc.trim();
      if (image) {
        // fire and forget
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save().then((result) => {
        console.log("Updated Product");
        res.redirect("/admin/products");
      });
    })

    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  // populate allows you to tell mongoose to populate a certain field with all the detailed info and not just the id
  // select helps to define which field you want to select and unselect
  // title price include, minus -_id means exclude
  Product.find({ userId: req.user._id })
    // .select("title price -_id")
    // .populate("userId", "name")
    .then((products) => {
      // console.log(products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error("Product not found."));
      }
      return Product.deleteOne({ _id: prodId, userId: req.user._id }).then(
        () => {
          // Delete the product image from the server
          fileHelper.deleteFile(product.imageUrl);
          // Delete the product from every users cart
          User.find({}, (err, users) => {
            users.forEach((user) => {
              user.removeFromCart(prodId);
            });
          });
        }
      );
    })
    .then(() => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
