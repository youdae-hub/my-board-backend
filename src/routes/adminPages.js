const express = require("express");
const adminSession = require("../middleware/adminSession");
const prisma = require("../lib/prisma");

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("admin/login");
});

router.use(adminSession);

router.get("/", async (req, res) => {
  const [users, posts, admins] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.admin.count(),
  ]);

  res.render("admin/dashboard", {
    title: "대시보드",
    currentPage: "dashboard",
    admin: req.admin,
    token: req.adminToken,
    stats: { users, posts, admins },
  });
});

router.get("/admins", (req, res) => {
  if (req.admin.role !== "SUPER") return res.redirect("/admin");
  res.render("admin/admins/list", {
    title: "관리자 관리",
    currentPage: "admins",
    admin: req.admin,
    token: req.adminToken,
  });
});

router.get("/admins/create", (req, res) => {
  if (req.admin.role !== "SUPER") return res.redirect("/admin");
  res.render("admin/admins/create", {
    title: "관리자 추가",
    currentPage: "admins",
    admin: req.admin,
    token: req.adminToken,
  });
});

router.get("/members", (req, res) => {
  res.render("admin/members/list", {
    title: "회원 관리",
    currentPage: "members",
    admin: req.admin,
    token: req.adminToken,
  });
});

router.get("/members/:id", (req, res) => {
  res.render("admin/members/detail", {
    title: "회원 상세",
    currentPage: "members",
    admin: req.admin,
    token: req.adminToken,
    memberId: req.params.id,
  });
});

router.get("/posts", (req, res) => {
  res.render("admin/posts/list", {
    title: "게시판 관리",
    currentPage: "posts",
    admin: req.admin,
    token: req.adminToken,
  });
});

router.get("/posts/:id", (req, res) => {
  res.render("admin/posts/detail", {
    title: "게시글 상세",
    currentPage: "posts",
    admin: req.admin,
    token: req.adminToken,
    postId: req.params.id,
  });
});

router.get("/logs/admin", (req, res) => {
  if (req.admin.role !== "SUPER") return res.redirect("/admin");
  res.render("admin/logs/admin", {
    title: "관리자 로그",
    currentPage: "adminLogs",
    admin: req.admin,
    token: req.adminToken,
  });
});

router.get("/logs/users", (req, res) => {
  res.render("admin/logs/users", {
    title: "사용자 로그",
    currentPage: "userLogs",
    admin: req.admin,
    token: req.adminToken,
  });
});

module.exports = router;
