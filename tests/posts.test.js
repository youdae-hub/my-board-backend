const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret";

describe("GET /api/posts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and list of posts with author nickname", async () => {
    prisma.post.findMany.mockResolvedValue([
      {
        id: 1,
        title: "첫 번째 글",
        content: "내용입니다",
        createdAt: "2026-04-08T00:00:00.000Z",
        updatedAt: "2026-04-08T00:00:00.000Z",
        user: { nickname: "tester" },
      },
    ]);

    const res = await request(app).get("/api/posts");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("첫 번째 글");
    expect(res.body[0].user.nickname).toBe("tester");
  });

  it("should return 200 and empty array when no posts", async () => {
    prisma.post.findMany.mockResolvedValue([]);

    const res = await request(app).get("/api/posts");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("should return posts ordered by latest first", async () => {
    prisma.post.findMany.mockResolvedValue([
      { id: 2, title: "최신 글", createdAt: "2026-04-08T12:00:00.000Z", user: { nickname: "a" } },
      { id: 1, title: "오래된 글", createdAt: "2026-04-07T12:00:00.000Z", user: { nickname: "b" } },
    ]);

    const res = await request(app).get("/api/posts");

    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe("최신 글");
    expect(res.body[1].title).toBe("오래된 글");

    const findManyCall = prisma.post.findMany.mock.calls[0][0];
    expect(findManyCall.orderBy.createdAt).toBe("desc");
  });
});

describe("POST /api/posts", () => {
  const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a post and return 201", async () => {
    prisma.post.create.mockResolvedValue({
      id: 1,
      title: "테스트 글",
      content: "테스트 내용",
      userId: 1,
      createdAt: "2026-04-08T00:00:00.000Z",
      updatedAt: "2026-04-08T00:00:00.000Z",
    });

    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "테스트 글", content: "테스트 내용" });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("테스트 글");
    expect(res.body.userId).toBe(1);
  });

  it("should use userId from JWT token", async () => {
    prisma.post.create.mockResolvedValue({
      id: 1,
      title: "글",
      content: "내용",
      userId: 1,
    });

    await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "글", content: "내용" });

    const createCall = prisma.post.create.mock.calls[0][0];
    expect(createCall.data.userId).toBe(1);
  });

  it("should return 400 if title or content is missing", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "제목만" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("제목과 내용을 입력해주세요.");
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app)
      .post("/api/posts")
      .send({ title: "글", content: "내용" });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/posts/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and post detail with author nickname", async () => {
    prisma.post.findUnique.mockResolvedValue({
      id: 1,
      title: "테스트 글",
      content: "테스트 내용",
      userId: 1,
      createdAt: "2026-04-08T00:00:00.000Z",
      updatedAt: "2026-04-08T00:00:00.000Z",
      user: { nickname: "tester" },
    });

    const res = await request(app).get("/api/posts/1");

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("테스트 글");
    expect(res.body.user.nickname).toBe("tester");
  });

  it("should return 404 if post not found", async () => {
    prisma.post.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/api/posts/999");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("게시글을 찾을 수 없습니다.");
  });
});

describe("PUT /api/posts/:id", () => {
  const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update own post and return 200", async () => {
    prisma.post.findUnique.mockResolvedValue({
      id: 1,
      title: "원래 제목",
      content: "원래 내용",
      userId: 1,
    });
    prisma.post.update.mockResolvedValue({
      id: 1,
      title: "수정된 제목",
      content: "수정된 내용",
      userId: 1,
    });

    const res = await request(app)
      .put("/api/posts/1")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "수정된 제목", content: "수정된 내용" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("수정된 제목");
  });

  it("should return 403 if not the author", async () => {
    prisma.post.findUnique.mockResolvedValue({
      id: 1,
      title: "남의 글",
      content: "내용",
      userId: 999,
    });

    const res = await request(app)
      .put("/api/posts/1")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "수정 시도", content: "내용" });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("본인의 글만 수정할 수 있습니다.");
  });

  it("should return 404 if post not found", async () => {
    prisma.post.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .put("/api/posts/999")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "제목", content: "내용" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("게시글을 찾을 수 없습니다.");
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app)
      .put("/api/posts/1")
      .send({ title: "제목", content: "내용" });

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/posts/:id", () => {
  const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete own post and return 200", async () => {
    prisma.post.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
    });
    prisma.post.delete.mockResolvedValue({ id: 1 });

    const res = await request(app)
      .delete("/api/posts/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("게시글이 삭제되었습니다.");
  });

  it("should return 403 if not the author", async () => {
    prisma.post.findUnique.mockResolvedValue({
      id: 1,
      userId: 999,
    });

    const res = await request(app)
      .delete("/api/posts/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("본인의 글만 삭제할 수 있습니다.");
  });

  it("should return 404 if post not found", async () => {
    prisma.post.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .delete("/api/posts/999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("게시글을 찾을 수 없습니다.");
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app).delete("/api/posts/1");

    expect(res.status).toBe(401);
  });
});
