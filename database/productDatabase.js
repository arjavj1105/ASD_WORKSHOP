let products = [
  { id: 1, name: "Laptop", price: 65000, category: "Electronics" },
  { id: 2, name: "Headphones", price: 2500, category: "Electronics" },
  { id: 3, name: "Backpack", price: 1800, category: "Accessories" }
];

let nextId = 4;

function getAllProducts() {
  return products.map(product => ({ ...product }));
}

function getProductById(id) {
  const product = products.find(item => item.id === Number(id));
  return product ? { ...product } : null;
}

function createProduct(data) {
  const product = { id: nextId++, ...data };
  products.push(product);
  return { ...product };
}

function updateProduct(id, data) {
  const index = products.findIndex(item => item.id === Number(id));
  if (index === -1) return null;
  products[index] = { ...products[index], ...data, id: Number(id) };
  return { ...products[index] };
}

function deleteProduct(id) {
  const index = products.findIndex(item => item.id === Number(id));
  if (index === -1) return null;
  const [deletedProduct] = products.splice(index, 1);
  return { ...deletedProduct };
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
