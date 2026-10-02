const cache = new Map();
const TTL = 60 * 1000;

function getCacheKey(req) {
  return `${req.method}:${req.originalUrl}`;
}

function cacheMiddleware(req, res, next) {
  const key = getCacheKey(req);
  const entry = cache.get(key);

  if (!entry) {
    res.set("X-Cache", "MISS");
    res.locals.cacheKey = key;
    return next();
  }

  const age = Date.now() - entry.createdAt;

  if (age >= TTL) {
    cache.delete(key);
    res.set("X-Cache", "MISS");
    res.locals.cacheKey = key;
    return next();
  }

  res.set("X-Cache", "HIT");
  return res.status(200).json(entry.value);
}

function storeInCache(key, value) {
  cache.set(key, {
    value,
    createdAt: Date.now()
  });
}

function cacheResponse(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = body => {
    if (res.statusCode >= 200 && res.statusCode < 300 && res.locals.cacheKey) {
      storeInCache(res.locals.cacheKey, body);
    }
    return originalJson(body);
  };

  next();
}

function invalidateCacheOnSuccess(req, res, next) {
  const clearCache = () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.clear();
    }
  };

  res.on("finish", clearCache);
  next();
}

function clearCache() {
  cache.clear();
}

function getCacheSize() {
  return cache.size;
}

module.exports = {
  TTL,
  cacheMiddleware,
  cacheResponse,
  invalidateCacheOnSuccess,
  clearCache,
  getCacheSize
};
