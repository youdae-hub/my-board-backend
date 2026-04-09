const jwt = require("jsonwebtoken");

const adminSession = (req, res, next) => {
  const token = req.cookies?.adminToken;

  if (!token) {
    return res.redirect("/admin/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "admin") {
      return res.redirect("/admin/login");
    }

    req.admin = decoded;
    req.adminToken = token;
    next();
  } catch (err) {
    return res.redirect("/admin/login");
  }
};

module.exports = adminSession;
