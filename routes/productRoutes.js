const express = require("express");
const controller = require("../controllers/productController");
const {
  cacheMiddleware,
  cacheResponse,
  invalidateCacheOnSuccess
} = require("../middleware/cacheMiddleware");

const router = express.Router();

router.get("/", cacheMiddleware, cacheResponse, controller.getProducts);
router.get("/:id", cacheMiddleware, cacheResponse, controller.getProduct);
router.post("/", invalidateCacheOnSuccess, controller.createProduct);
router.put("/:id", invalidateCacheOnSuccess, controller.updateProduct);
router.patch("/:id", invalidateCacheOnSuccess, controller.patchProduct);
router.delete("/:id", invalidateCacheOnSuccess, controller.deleteProduct);

module.exports = router;
