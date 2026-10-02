const productService = require("../services/productService");

function getProducts(req, res) {
  const products = productService.getProducts();
  res.status(200).json(products);
}

function getProduct(req, res) {
  const product = productService.getProduct(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.status(200).json(product);
}

function createProduct(req, res) {
  const { name, price, category } = req.body;

  if (!name || price === undefined || !category) {
    return res.status(400).json({ message: "name, price and category are required" });
  }

  const product = productService.createProduct({ name, price, category });
  return res.status(201).json(product);
}

function updateProduct(req, res) {
  const product = productService.updateProduct(req.params.id, req.body);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.status(200).json(product);
}

function patchProduct(req, res) {
  const product = productService.updateProduct(req.params.id, req.body);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.status(200).json(product);
}

function deleteProduct(req, res) {
  const product = productService.deleteProduct(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.status(200).json(product);
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  patchProduct,
  deleteProduct
};
