const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { logAdminAction } = require("../lib/logAction");

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "이메일과 비밀번호를 입력해주세요." });
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
  }

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
  }

  if (!admin.isActive) {
    return res.status(403).json({ message: "비활성화된 계정입니다." });
  }

  const token = jwt.sign(
    { id: admin.id, role: admin.role, type: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  logAdminAction({ adminId: admin.id, action: "LOGIN", ipAddress: req.ip }).catch(() => {});

  res.json({
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
  });
};

module.exports = { login };
