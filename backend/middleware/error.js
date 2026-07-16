export const notFound = (req, res) => res.status(404).json({ message: "Route not found" });

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ message: err.message || "Server Error" });
};