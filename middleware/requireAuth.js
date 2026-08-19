// middleware/requireAuth.js
// Blocks access to a route unless the request has a logged-in session user.

module.exports = function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "You must be logged in to do that." });
  }
  next();
};
