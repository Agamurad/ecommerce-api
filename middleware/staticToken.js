module.exports = async function (req, res, next) {
  try {
    const token = process.env.ECOMMERCE_ACCESS;
    const incomingToken = req.headers["ecommerce-access"];

    if (!Object.keys(req.headers).includes("ecommerce-access")) {
      return res.status(401).send("no access");
    }

    if (!incomingToken) {
      return res.status(401).send("no access");
    }

    if (incomingToken !== token) {
      return res.status(401).send("no access");
    }
    next();
  } catch (error) {
    console.log(error);
  }
};
