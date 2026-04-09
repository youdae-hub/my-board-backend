const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret";

const superToken = jwt.sign({ id: 1, role: "SUPER", type: "admin" }, process.env.JWT_SECRET);
const regularToken = jwt.sign({ id: 2, role: "REGULAR", type: "admin" }, process.env.JWT_SECRET);

describe("POST /api/admin/admins", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should create a new admin and return 201", async () => {
    prisma.admin.findUnique.mockResolvedValue(null);
    prisma.admin.create.mockResolvedValue({
      id: 2,
      email: "new@test.com",
      name: "새관리자",
      role: "REGULAR",
      isActive: true,
      createdAt: new Date(),
    });

    const res = await request(app)
      .post("/api/admin/admins")
      .set("Authorization", `Bearer ${superToken}`)
      .send({ email: "new@test.com", password: "pass1234", name: "새관리자" });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("new@test.com");
    expect(res.body).not.toHaveProperty("password");
  });

  it("should return 409 if email already exists", async () => {
    prisma.admin.findUnique.mockResolvedValue({ id: 1, email: "dup@test.com" });

    const res = await request(app)
      .post("/api/admin/admins")
      .set("Authorization", `Bearer ${superToken}`)
      .send({ email: "dup@test.com", password: "pass1234", name: "중복" });

    expect(res.status).toBe(409);
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/admin/admins")
      .set("Authorization", `Bearer ${superToken}`)
      .send({ email: "test@test.com" });

    expect(res.status).toBe(400);
  });

  it("should return 403 if REGULAR admin tries to create", async () => {
    const res = await request(app)
      .post("/api/admin/admins")
      .set("Authorization", `Bearer ${regularToken}`)
      .send({ email: "new@test.com", password: "pass1234", name: "새관리자" });

    expect(res.status).toBe(403);
  });
});

describe("GET /api/admin/admins", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return list of admins without passwords", async () => {
    prisma.admin.findMany.mockResolvedValue([
      { id: 1, email: "admin@test.com", name: "관리자", role: "SUPER", isActive: true, createdAt: new Date() },
    ]);

    const res = await request(app)
      .get("/api/admin/admins")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).not.toHaveProperty("password");
  });
});

describe("PATCH /api/admin/admins/:id/disable", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should disable an admin", async () => {
    prisma.admin.findUnique.mockResolvedValue({ id: 2, isActive: true });
    prisma.admin.update.mockResolvedValue({ id: 2, isActive: false });

    const res = await request(app)
      .patch("/api/admin/admins/2/disable")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(200);
    expect(res.body.isActive).toBe(false);
  });

  it("should return 400 if trying to disable self", async () => {
    prisma.admin.findUnique.mockResolvedValue({ id: 1, isActive: true });

    const res = await request(app)
      .patch("/api/admin/admins/1/disable")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("본인 계정은 비활성화할 수 없습니다.");
  });

  it("should return 404 if admin not found", async () => {
    prisma.admin.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch("/api/admin/admins/999/disable")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/admin/admins/:id/enable", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should enable an admin", async () => {
    prisma.admin.findUnique.mockResolvedValue({ id: 2, isActive: false });
    prisma.admin.update.mockResolvedValue({ id: 2, isActive: true });

    const res = await request(app)
      .patch("/api/admin/admins/2/enable")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(200);
    expect(res.body.isActive).toBe(true);
  });
});
