const Product = require("../models/Product");

exports.getAddProduct = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  res.render("admin/edit-product", {
    pageTitle: "Add product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
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
    .catch((err) => console.log(err));
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
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const {
    productId: prodId,
    title: updatedTitle,
    price: updatedPrice,
    imageUrl: updatedImageUrl,
    description: updatedDesc,
  } = req.body;
  Product.findById(prodId)
    .then((product) => {
      product.title = updatedTitle.trim();
      product.price = updatedPrice.trim();
      product.description = updatedDesc.trim();
      product.imageUrl = updatedImageUrl.trim();
      return product.save();
    })
    .then((result) => {
      console.log("Updated Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  // populate allows you to tell mongoose to populate a certain field with all the detailed info and not just the id
  // select helps to define which field you want to select and unselect
  // title price include, minus -_id means exclude
  Product.find()
    // .select("title price -_id")
    // .populate("userId", "name")
    .then((products) => {
      console.log(products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin products",
        path: "/admin/products",
      });
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByIdAndRemove(prodId)
    .then(() => {
      console.log("Deleted succesfully");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};
