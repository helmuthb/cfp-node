module.exports = {
  isLoggedIn: (req, res, next) =>
    req.isAuthenticated()
      ? next()
      : res.status(401).send({ error: "You are not logged in" }),
  isActivated: (req, res, next) =>
    req.isAuthenticated() && !req.user.activation_key
      ? next()
      : res.status(401).send({ error: "You are not logged in" })
};
