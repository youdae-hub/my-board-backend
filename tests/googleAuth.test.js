const request = require("supertest");
const prisma = require("../src/lib/prisma");

const mockVerifyIdToken = jest.fn();

jest.mock("google-auth-library", () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}));

const app = require("../src/app");

describe("POST /api/auth/google", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("credential이 없으면 400 반환", async () => {
    const res = await request(app).post("/api/auth/google").send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("구글 토큰이 필요합니다.");
  });

  it("유효하지 않은 토큰이면 401 반환", async () => {
    mockVerifyIdToken.mockRejectedValue(new Error("Invalid token"));

    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "invalid-token" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("유효하지 않은 구글 토큰입니다.");
  });

  it("신규 사용자는 자동 회원가입 후 토큰 발급", async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: "google-id-123",
        email: "new@gmail.com",
        name: "새사용자",
      }),
    });

    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 1,
      email: "new@gmail.com",
      nickname: "새사용자",
      provider: "google",
      googleId: "google-id-123",
    });

    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "valid-token" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("new@gmail.com");
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: "new@gmail.com",
        nickname: "새사용자",
        provider: "google",
        googleId: "google-id-123",
      },
    });
  });

  it("기존 구글 사용자는 그대로 로그인", async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: "google-id-123",
        email: "existing@gmail.com",
        name: "기존사용자",
      }),
    });

    prisma.user.findUnique.mockResolvedValue({
      id: 2,
      email: "existing@gmail.com",
      nickname: "기존사용자",
      provider: "google",
      googleId: "google-id-123",
    });

    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "valid-token" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.id).toBe(2);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("기존 일반(local) 사용자와 이메일 동일하면 계정 통합", async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: "google-id-456",
        email: "local@gmail.com",
        name: "로컬사용자",
      }),
    });

    prisma.user.findUnique.mockResolvedValue({
      id: 3,
      email: "local@gmail.com",
      nickname: "로컬사용자",
      provider: "local",
      googleId: null,
      password: "hashed-password",
    });

    prisma.user.update.mockResolvedValue({
      id: 3,
      email: "local@gmail.com",
      nickname: "로컬사용자",
      provider: "google",
      googleId: "google-id-456",
    });

    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "valid-token" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.id).toBe(3);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { provider: "google", googleId: "google-id-456" },
    });
  });

  it("통합된 계정은 일반 로그인도 가능", async () => {
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash("password123", 10);

    prisma.user.findUnique.mockResolvedValue({
      id: 3,
      email: "local@gmail.com",
      nickname: "로컬사용자",
      provider: "google",
      googleId: "google-id-456",
      password: hashedPassword,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "local@gmail.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("구글 전용 사용자는 비밀번호 로그인 불가", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 4,
      email: "googleonly@gmail.com",
      nickname: "구글사용자",
      provider: "google",
      googleId: "google-id-789",
      password: null,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "googleonly@gmail.com", password: "anypassword" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("구글 로그인을 이용해주세요.");
  });
});
