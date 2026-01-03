const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).json({ message: "You do not have authority" });
  }
  try {
    const decodedToken = jwt.verify(token, "jwtPrivateKey");
    req.user = decodedToken;
    next();
  } catch (error) {
    console.log("Wrong token");
  }
};
