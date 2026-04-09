const request = require("supertest");
const app = require("../src/app");

describe("GET /api/health", () => {
  it("should return status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("Express body size limit", () => {
  it("should accept large JSON body up to 10mb", async () => {
    const largeContent = "x".repeat(5 * 1024 * 1024);

    const res = await request(app)
      .post("/api/posts")
      .send({ title: "test", content: largeContent });

    expect(res.status).not.toBe(413);
  });
});
