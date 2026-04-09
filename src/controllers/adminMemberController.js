const prisma = require("../lib/prisma");
const { logAdminAction } = require("../lib/logAction");

const getMembers = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [members, total] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, email: true, nickname: true, createdAt: true, _count: { select: { posts: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count(),
  ]);

  res.json({ members, total, page, totalPages: Math.ceil(total / limit) });
};

const getMember = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    select: {
      id: true, email: true, nickname: true, createdAt: true,
      posts: { select: { id: true, title: true, createdAt: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!user) {
    return res.status(404).json({ message: "회원을 찾을 수 없습니다." });
  }

  res.json(user);
};

const updateMember = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
  if (!user) {
    return res.status(404).json({ message: "회원을 찾을 수 없습니다." });
  }

  const { nickname, email } = req.body;
  const updated = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { ...(nickname && { nickname }), ...(email && { email }) },
    select: { id: true, email: true, nickname: true },
  });

  logAdminAction({ adminId: req.admin.id, action: "UPDATE_MEMBER", target: "User", targetId: Number(req.params.id), ipAddress: req.ip }).catch(() => {});

  res.json(updated);
};

const deleteMember = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
  if (!user) {
    return res.status(404).json({ message: "회원을 찾을 수 없습니다." });
  }

  await prisma.user.delete({ where: { id: Number(req.params.id) } });

  logAdminAction({ adminId: req.admin.id, action: "DELETE_MEMBER", target: "User", targetId: Number(req.params.id), ipAddress: req.ip }).catch(() => {});

  res.json({ message: "회원이 삭제되었습니다." });
};

module.exports = { getMembers, getMember, updateMember, deleteMember };
