const prisma = require("./prisma");

const logAdminAction = async ({ adminId, action, target, targetId, detail, ipAddress }) => {
  await prisma.adminLog.create({
    data: { adminId, action, target, targetId, detail, ipAddress },
  });
};

const logUserActivity = async ({ userId, action, target, targetId, detail, ipAddress }) => {
  await prisma.userActivityLog.create({
    data: { userId, action, target, targetId, detail, ipAddress },
  });
};

module.exports = { logAdminAction, logUserActivity };
