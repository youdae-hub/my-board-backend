const bcrypt = require("bcrypt");
const prisma = require("../lib/prisma");
const { logAdminAction } = require("../lib/logAction");

const adminSelect = { id: true, email: true, name: true, role: true, isActive: true, createdAt: true };

const createAdmin = async (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: "모든 필드를 입력해주세요." });
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "이미 사용 중인 이메일입니다." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.create({
    data: { email, password: hashedPassword, name, role: role || "REGULAR" },
    select: adminSelect,
  });

  logAdminAction({ adminId: req.admin.id, action: "CREATE_ADMIN", target: "Admin", targetId: admin.id, ipAddress: req.ip }).catch(() => {});

  res.status(201).json(admin);
};

const getAdmins = async (req, res) => {
  const admins = await prisma.admin.findMany({
    select: adminSelect,
    orderBy: { createdAt: "desc" },
  });
  res.json(admins);
};

const disableAdmin = async (req, res) => {
  const id = Number(req.params.id);

  if (id === req.admin.id) {
    return res.status(400).json({ message: "본인 계정은 비활성화할 수 없습니다." });
  }

  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) {
    return res.status(404).json({ message: "관리자를 찾을 수 없습니다." });
  }

  const updated = await prisma.admin.update({
    where: { id },
    data: { isActive: false },
  });

  logAdminAction({ adminId: req.admin.id, action: "DISABLE_ADMIN", target: "Admin", targetId: id, ipAddress: req.ip }).catch(() => {});

  res.json(updated);
};

const enableAdmin = async (req, res) => {
  const id = Number(req.params.id);

  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) {
    return res.status(404).json({ message: "관리자를 찾을 수 없습니다." });
  }

  const updated = await prisma.admin.update({
    where: { id },
    data: { isActive: true },
  });

  logAdminAction({ adminId: req.admin.id, action: "ENABLE_ADMIN", target: "Admin", targetId: id, ipAddress: req.ip }).catch(() => {});

  res.json(updated);
};

module.exports = { createAdmin, getAdmins, disableAdmin, enableAdmin };
