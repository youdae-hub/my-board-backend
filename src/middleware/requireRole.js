const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ message: "권한이 없습니다." });
    }
    next();
  };
};

module.exports = requireRole;
