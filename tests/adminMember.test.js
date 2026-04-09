const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret";

const superToken = jwt.sign({ id: 1, role: "SUPER", type: "admin" }, process.env.JWT_SECRET);
const regularToken = jwt.sign({ id: 2, role: "REGULAR", type: "admin" }, process.env.JWT_SECRET);

describe("GET /api/admin/members", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return paginated member list", async () => {
    prisma.user.findMany.mockResolvedValue([
      { id: 1, email: "user@test.com", nickname: "유저1", createdAt: new Date(), _count: { posts: 3 } },
    ]);
    prisma.user.count.mockResolvedValue(1);

    const res = await request(app)
      .get("/api/admin/members")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(200);
    expect(res.body.members).toHaveLength(1);
    expect(res.body.total).toBe(1);
  });

  it("should be accessible by REGULAR admin", async () => {
    prisma.user.findMany.mockResolvedValue([]);
    prisma.user.count.mockResolvedValue(0);

    const res = await request(app)
      .get("/api/admin/members")
      .set("Authorization", `Bearer ${regularToken}`);

    expect(res.status).toBe(200);
  });
});

describe("GET /api/admin/members/:id", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return member detail with posts", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1, email: "user@test.com", nickname: "유저1", createdAt: new Date(),
      posts: [{ id: 1, title: "글제목", createdAt: new Date() }],
    });

    const res = await request(app)
      .get("/api/admin/members/1")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("user@test.com");
    expect(res.body.posts).toHaveLength(1);
  });

  it("should return 404 if member not found", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/admin/members/999")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/admin/members/:id", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should update member info", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1 });
    prisma.user.update.mockResolvedValue({ id: 1, nickname: "새닉네임", email: "user@test.com" });

    const res = await request(app)
      .patch("/api/admin/members/1")
      .set("Authorization", `Bearer ${superToken}`)
      .send({ nickname: "새닉네임" });

    expect(res.status).toBe(200);
    expect(res.body.nickname).toBe("새닉네임");
  });
});

describe("DELETE /api/admin/members/:id", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should delete member (SUPER only)", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1 });
    prisma.user.delete.mockResolvedValue({ id: 1 });

    const res = await request(app)
      .delete("/api/admin/members/1")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("회원이 삭제되었습니다.");
  });

  it("should return 403 if REGULAR admin tries to delete", async () => {
    const res = await request(app)
      .delete("/api/admin/members/1")
      .set("Authorization", `Bearer ${regularToken}`);

    expect(res.status).toBe(403);
  });

  it("should return 404 if member not found", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .delete("/api/admin/members/999")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(404);
  });
});
