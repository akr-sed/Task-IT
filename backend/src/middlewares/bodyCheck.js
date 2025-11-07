// authMiddleware.js

export default async function bodyCheck(req, res, next) {
  if (!req.body) {
    return res.status(400).json({
      error: "empty body",
    });
  }
  next();
}
