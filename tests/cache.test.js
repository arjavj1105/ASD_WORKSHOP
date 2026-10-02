const assert = require("node:assert");
const EventEmitter = require("node:events");
const controller = require("../controllers/productController");
const {
  cacheMiddleware,
  cacheResponse,
  invalidateCacheOnSuccess,
  clearCache,
  getCacheSize,
  TTL
} = require("../middleware/cacheMiddleware");

function createResponse() {
  const response = new EventEmitter();
  response.statusCode = 200;
  response.locals = {};
  response.headers = {};
  response.body = undefined;
  response.set = (name, value) => {
    response.headers[name] = value;
  };
  response.status = code => {
    response.statusCode = code;
    return response;
  };
  response.json = body => {
    response.body = body;
    return response;
  };
  return response;
}

function createRequest(method, url, body = undefined, params = {}) {
  return {
    method,
    originalUrl: url,
    body,
    params
  };
}

function runGet(req, controllerFunction) {
  const res = createResponse();
  let nextCalled = false;
  cacheMiddleware(req, res, () => {
    nextCalled = true;
    cacheResponse(req, res, () => controllerFunction(req, res));
  });
  return { res, nextCalled };
}

function testGetProductsHitAndMiss() {
  clearCache();

  const first = runGet(createRequest("GET", "/products"), controller.getProducts);
  assert.equal(first.res.headers["X-Cache"], "MISS");
  assert.equal(first.nextCalled, true);
  assert.equal(Array.isArray(first.res.body), true);

  const second = runGet(createRequest("GET", "/products"), controller.getProducts);
  assert.equal(second.res.headers["X-Cache"], "HIT");
  assert.equal(second.nextCalled, false);
  assert.deepEqual(second.res.body, first.res.body);
}

function testGetProductByIdCache() {
  clearCache();

  const first = runGet(
    createRequest("GET", "/products/1", undefined, { id: "1" }),
    controller.getProduct
  );
  assert.equal(first.res.headers["X-Cache"], "MISS");
  assert.equal(first.res.body.id, 1);

  const second = runGet(
    createRequest("GET", "/products/1", undefined, { id: "1" }),
    controller.getProduct
  );
  assert.equal(second.res.headers["X-Cache"], "HIT");
  assert.equal(second.res.body.id, 1);
}

function testTtlExpiry() {
  clearCache();
  const originalNow = Date.now;
  let now = 1000000;
  Date.now = () => now;

  try {
    const first = runGet(createRequest("GET", "/products"), controller.getProducts);
    assert.equal(first.res.headers["X-Cache"], "MISS");

    now += TTL - 1;
    const beforeExpiry = runGet(createRequest("GET", "/products"), controller.getProducts);
    assert.equal(beforeExpiry.res.headers["X-Cache"], "HIT");

    now += 1;
    const afterExpiry = runGet(createRequest("GET", "/products"), controller.getProducts);
    assert.equal(afterExpiry.res.headers["X-Cache"], "MISS");
  } finally {
    Date.now = originalNow;
    clearCache();
  }
}

function testMutationInvalidatesAllCacheEntries() {
  clearCache();
  runGet(createRequest("GET", "/products"), controller.getProducts);
  runGet(createRequest("GET", "/products/1", undefined, { id: "1" }), controller.getProduct);
  assert.equal(getCacheSize(), 2);

  const req = createRequest("POST", "/products", {
    name: "Mouse",
    price: 1200,
    category: "Electronics"
  });
  const res = createResponse();
  invalidateCacheOnSuccess(req, res, () => controller.createProduct(req, res));
  res.emit("finish");

  assert.equal(res.statusCode, 201);
  assert.equal(getCacheSize(), 0);
}

function testFailedMutationDoesNotInvalidate() {
  clearCache();
  runGet(createRequest("GET", "/products"), controller.getProducts);
  assert.equal(getCacheSize(), 1);

  const req = createRequest("DELETE", "/products/999", undefined, { id: "999" });
  const res = createResponse();
  invalidateCacheOnSuccess(req, res, () => controller.deleteProduct(req, res));
  res.emit("finish");

  assert.equal(res.statusCode, 404);
  assert.equal(getCacheSize(), 1);
}

testGetProductsHitAndMiss();
testGetProductByIdCache();
testTtlExpiry();
testMutationInvalidatesAllCacheEntries();
testFailedMutationDoesNotInvalidate();

console.log("All cache tests passed");
