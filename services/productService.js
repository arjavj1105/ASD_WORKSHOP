const database = require("../database/productDatabase");

function getProducts() {
  return database.getAllProducts();
}

function getProduct(id) {
  return database.getProductById(id);
}

function createProduct(data) {
  return database.createProduct(data);
}

function updateProduct(id, data) {
  return database.updateProduct(id, data);
}

function deleteProduct(id) {
  return database.deleteProduct(id);
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
