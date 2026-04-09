const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret";

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new user and return 201", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 1,
      email: "test@test.com",
      nickname: "tester",
      createdAt: new Date(),
    });

    const res = await request(app).post("/api/auth/signup").send({
      email: "test@test.com",
      password: "password123",
      nickname: "tester",
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("test@test.com");
    expect(res.body.user.nickname).toBe("tester");
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("should return 409 if email already exists", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: "test@test.com" });

    const res = await request(app).post("/api/auth/signup").send({
      email: "test@test.com",
      password: "password123",
      nickname: "tester",
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("이미 사용 중인 이메일입니다.");
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      email: "test@test.com",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("모든 필드를 입력해주세요.");
  });

  it("should hash the password before saving", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 1,
      email: "test@test.com",
      nickname: "tester",
      createdAt: new Date(),
    });

    await request(app).post("/api/auth/signup").send({
      email: "test@test.com",
      password: "password123",
      nickname: "tester",
    });

    const createCall = prisma.user.create.mock.calls[0][0];
    const hashedPassword = createCall.data.password;
    expect(hashedPassword).not.toBe("password123");
    const isHashed = await bcrypt.compare("password123", hashedPassword);
    expect(isHashed).toBe(true);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and token on successful login", async () => {
    const hashed = await bcrypt.hash("password123", 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: "test@test.com",
      password: hashed,
      nickname: "tester",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "test@test.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("test@test.com");
    expect(res.body.user).not.toHaveProperty("password");

    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(1);
  });

  it("should return 401 if email not found", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).post("/api/auth/login").send({
      email: "wrong@test.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("이메일 또는 비밀번호가 올바르지 않습니다.");
  });

  it("should return 401 if password is wrong", async () => {
    const hashed = await bcrypt.hash("password123", 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: "test@test.com",
      password: hashed,
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "test@test.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("이메일 또는 비밀번호가 올바르지 않습니다.");
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@test.com",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("이메일과 비밀번호를 입력해주세요.");
  });
});

describe("JWT Auth Middleware", () => {
  it("should pass with valid token", async () => {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("인증이 필요합니다.");
  });

  it("should return 401 if token is invalid", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("유효하지 않은 토큰입니다.");
  });
});
