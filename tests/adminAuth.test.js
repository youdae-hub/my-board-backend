const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret";

describe("POST /api/admin/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and token with admin info", async () => {
    const hashed = await bcrypt.hash("admin123", 10);
    prisma.admin.findUnique.mockResolvedValue({
      id: 1,
      email: "admin@test.com",
      password: hashed,
      name: "총괄관리자",
      role: "SUPER",
      isActive: true,
    });

    const res = await request(app).post("/api/admin/auth/login").send({
      email: "admin@test.com",
      password: "admin123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.admin.name).toBe("총괄관리자");
    expect(res.body.admin.role).toBe("SUPER");
    expect(res.body.admin).not.toHaveProperty("password");

    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.type).toBe("admin");
    expect(decoded.role).toBe("SUPER");
  });

  it("should return 401 for wrong credentials", async () => {
    prisma.admin.findUnique.mockResolvedValue(null);

    const res = await request(app).post("/api/admin/auth/login").send({
      email: "wrong@test.com",
      password: "wrong",
    });

    expect(res.status).toBe(401);
  });

  it("should return 403 if admin is disabled", async () => {
    const hashed = await bcrypt.hash("admin123", 10);
    prisma.admin.findUnique.mockResolvedValue({
      id: 1,
      email: "admin@test.com",
      password: hashed,
      name: "비활성관리자",
      role: "REGULAR",
      isActive: false,
    });

    const res = await request(app).post("/api/admin/auth/login").send({
      email: "admin@test.com",
      password: "admin123",
    });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("비활성화된 계정입니다.");
  });

  it("should return 400 if fields are missing", async () => {
    const res = await request(app).post("/api/admin/auth/login").send({
      email: "admin@test.com",
    });

    expect(res.status).toBe(400);
  });
});

describe("Admin Auth Middleware", () => {
  it("should reject user token on admin route", async () => {
    const userToken = jwt.sign({ id: 1 }, process.env.JWT_SECRET);

    const res = await request(app)
      .get("/api/admin/admins")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(401);
  });

  it("should pass with valid admin token", async () => {
    const adminToken = jwt.sign(
      { id: 1, role: "SUPER", type: "admin" },
      process.env.JWT_SECRET
    );
    prisma.admin.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get("/api/admin/admins")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});

describe("requireRole Middleware", () => {
  it("should return 403 if REGULAR tries SUPER-only route", async () => {
    const regularToken = jwt.sign(
      { id: 2, role: "REGULAR", type: "admin" },
      process.env.JWT_SECRET
    );

    const res = await request(app)
      .get("/api/admin/admins")
      .set("Authorization", `Bearer ${regularToken}`);

    expect(res.status).toBe(403);
  });
});
