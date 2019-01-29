const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader)
    return res.status(401).send({ error: "NO_TOKEN_PROVIDED" });

  const parts = authorizationHeader.split(" ");

  if (!parts.length === 2)
    return res.status(401).send({ error: "INVALID_PARTS" });

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme))
    return res.status(401).send({ error: "MALFORMATTED_TOKEN" });

  jwt.verify(token, process.env.JWT_HASH, (err, decoded) => {
    if (err) return res.status(401).send({ error: "INVALID_TOKEN" });
    req.userId = decoded.id;
    return next();
  });
};