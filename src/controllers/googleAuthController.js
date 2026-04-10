const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { logUserActivity } = require("../lib/logAction");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: "구글 토큰이 필요합니다." });
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ message: "유효하지 않은 구글 토큰입니다." });
  }

  const { sub: googleId, email, name } = payload;

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: { email, nickname: name, provider: "google", googleId },
    });
    logUserActivity({ userId: user.id, action: "SIGNUP_GOOGLE", ipAddress: req.ip }).catch(() => {});
  } else if (user.provider === "local") {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { provider: "google", googleId },
    });
    logUserActivity({ userId: user.id, action: "ACCOUNT_LINKED_GOOGLE", ipAddress: req.ip }).catch(() => {});
  } else {
    logUserActivity({ userId: user.id, action: "LOGIN_GOOGLE", ipAddress: req.ip }).catch(() => {});
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({
    token,
    user: { id: user.id, email: user.email, nickname: user.nickname },
  });
};

module.exports = { googleLogin };
