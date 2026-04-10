const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { logUserActivity } = require("../lib/logAction");

const signup = async (req, res) => {
  const { email, password, nickname } = req.body;

  if (!email || !password || !nickname) {
    return res.status(400).json({ message: "모든 필드를 입력해주세요." });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "이미 사용 중인 이메일입니다." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, nickname },
  });

  logUserActivity({ userId: user.id, action: "SIGNUP", ipAddress: req.ip }).catch(() => {});

  res.status(201).json({
    user: { id: user.id, email: user.email, nickname: user.nickname },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "이메일과 비밀번호를 입력해주세요." });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
  }

  if (!user.password) {
    return res.status(401).json({ message: "구글 로그인을 이용해주세요." });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  logUserActivity({ userId: user.id, action: "LOGIN", ipAddress: req.ip }).catch(() => {});

  res.json({
    token,
    user: { id: user.id, email: user.email, nickname: user.nickname },
  });
};

module.exports = { signup, login };
