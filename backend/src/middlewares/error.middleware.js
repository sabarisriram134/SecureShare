// Global error handling middleware for Express
// Usage: app.use(errorHandler)

function errorHandler(err, req, res, next) {
  console.error("Error:", err.stack || err);

  const status = err.status || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    success: false,
    message
  });
}

module.exports = errorHandler;
