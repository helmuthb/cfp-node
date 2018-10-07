module.exports = (req, res, next) =>
  req.isAuthenticated()
    ? next()
    : res.status(401).send({ error: "You are not logged in" });
