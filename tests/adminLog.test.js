const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret";

const superToken = jwt.sign({ id: 1, role: "SUPER", type: "admin" }, process.env.JWT_SECRET);
const regularToken = jwt.sign({ id: 2, role: "REGULAR", type: "admin" }, process.env.JWT_SECRET);

describe("GET /api/admin/logs/admin", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return admin logs (SUPER only)", async () => {
    prisma.adminLog.findMany.mockResolvedValue([
      { id: 1, adminId: 1, action: "LOGIN", createdAt: new Date(), admin: { name: "총괄관리자" } },
    ]);
    prisma.adminLog.count.mockResolvedValue(1);

    const res = await request(app)
      .get("/api/admin/logs/admin")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(200);
    expect(res.body.logs).toHaveLength(1);
    expect(res.body.total).toBe(1);
  });

  it("should return 403 for REGULAR admin", async () => {
    const res = await request(app)
      .get("/api/admin/logs/admin")
      .set("Authorization", `Bearer ${regularToken}`);

    expect(res.status).toBe(403);
  });
});

describe("GET /api/admin/logs/users", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return user activity logs", async () => {
    prisma.userActivityLog.findMany.mockResolvedValue([
      { id: 1, userId: 1, action: "LOGIN", createdAt: new Date(), user: { nickname: "유저1" } },
    ]);
    prisma.userActivityLog.count.mockResolvedValue(1);

    const res = await request(app)
      .get("/api/admin/logs/users")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(200);
    expect(res.body.logs).toHaveLength(1);
  });

  it("should be accessible by REGULAR admin", async () => {
    prisma.userActivityLog.findMany.mockResolvedValue([]);
    prisma.userActivityLog.count.mockResolvedValue(0);

    const res = await request(app)
      .get("/api/admin/logs/users")
      .set("Authorization", `Bearer ${regularToken}`);

    expect(res.status).toBe(200);
  });
});
