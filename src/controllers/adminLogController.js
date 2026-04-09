const prisma = require("../lib/prisma");

const getAdminLogs = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const where = {};
  if (req.query.adminId) where.adminId = Number(req.query.adminId);
  if (req.query.action) where.action = req.query.action;

  const [logs, total] = await Promise.all([
    prisma.adminLog.findMany({
      where,
      include: { admin: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.adminLog.count({ where }),
  ]);

  res.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
};

const getUserActivityLogs = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const where = {};
  if (req.query.userId) where.userId = Number(req.query.userId);
  if (req.query.action) where.action = req.query.action;

  const [logs, total] = await Promise.all([
    prisma.userActivityLog.findMany({
      where,
      include: { user: { select: { nickname: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.userActivityLog.count({ where }),
  ]);

  res.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
};

module.exports = { getAdminLogs, getUserActivityLogs };
