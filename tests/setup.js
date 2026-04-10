process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

jest.mock("../src/lib/prisma", () => ({
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  post: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  admin: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  adminLog: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  userActivityLog: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
}));
