const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret";

const superToken = jwt.sign({ id: 1, role: "SUPER", type: "admin" }, process.env.JWT_SECRET);

describe("GET /api/admin/posts", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return paginated post list with author", async () => {
    prisma.post.findMany.mockResolvedValue([
      { id: 1, title: "글제목", content: "내용", createdAt: new Date(), user: { nickname: "유저1" } },
    ]);
    prisma.post.count.mockResolvedValue(1);

    const res = await request(app)
      .get("/api/admin/posts")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(200);
    expect(res.body.posts).toHaveLength(1);
    expect(res.body.posts[0].user.nickname).toBe("유저1");
  });

  it("should support search query", async () => {
    prisma.post.findMany.mockResolvedValue([]);
    prisma.post.count.mockResolvedValue(0);

    const res = await request(app)
      .get("/api/admin/posts?search=검색어")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(200);
    const call = prisma.post.findMany.mock.calls[0][0];
    expect(call.where.OR).toBeDefined();
  });
});

describe("GET /api/admin/posts/:id", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return post detail", async () => {
    prisma.post.findUnique.mockResolvedValue({
      id: 1, title: "글", content: "내용", user: { nickname: "유저1", email: "u@test.com" },
    });

    const res = await request(app)
      .get("/api/admin/posts/1")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("글");
  });

  it("should return 404 if not found", async () => {
    prisma.post.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/admin/posts/999")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(404);
  });
});

describe("PUT /api/admin/posts/:id", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should update any post without ownership check", async () => {
    prisma.post.findUnique.mockResolvedValue({ id: 1, userId: 999 });
    prisma.post.update.mockResolvedValue({ id: 1, title: "수정됨", content: "수정내용" });

    const res = await request(app)
      .put("/api/admin/posts/1")
      .set("Authorization", `Bearer ${superToken}`)
      .send({ title: "수정됨", content: "수정내용" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("수정됨");
  });
});

describe("DELETE /api/admin/posts/:id", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should delete any post without ownership check", async () => {
    prisma.post.findUnique.mockResolvedValue({ id: 1, userId: 999 });
    prisma.post.delete.mockResolvedValue({ id: 1 });

    const res = await request(app)
      .delete("/api/admin/posts/1")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("게시글이 삭제되었습니다.");
  });

  it("should return 404 if not found", async () => {
    prisma.post.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .delete("/api/admin/posts/999")
      .set("Authorization", `Bearer ${superToken}`);

    expect(res.status).toBe(404);
  });
});
