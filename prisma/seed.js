const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@myboard.com";
  const existing = await prisma.admin.findUnique({ where: { email } });

  if (existing) {
    console.log("초기 관리자가 이미 존재합니다:", email);
    return;
  }

  const hashedPassword = await bcrypt.hash("admin1234", 10);

  const admin = await prisma.admin.create({
    data: {
      email,
      password: hashedPassword,
      name: "총괄관리자",
      role: "SUPER",
    },
  });

  console.log("초기 SUPER 관리자 생성 완료:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
