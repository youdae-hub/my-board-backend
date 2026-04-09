const express = require("express");
const { login } = require("../controllers/adminAuthController");
const { createAdmin, getAdmins, disableAdmin, enableAdmin } = require("../controllers/adminController");
const { getMembers, getMember, updateMember, deleteMember } = require("../controllers/adminMemberController");
const adminPostController = require("../controllers/adminPostController");
const { getAdminLogs, getUserActivityLogs } = require("../controllers/adminLogController");
const adminAuth = require("../middleware/adminAuth");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.post("/auth/login", login);

router.use(adminAuth);

router.post("/admins", requireRole("SUPER"), createAdmin);
router.get("/admins", requireRole("SUPER"), getAdmins);
router.patch("/admins/:id/disable", requireRole("SUPER"), disableAdmin);
router.patch("/admins/:id/enable", requireRole("SUPER"), enableAdmin);

router.get("/members", getMembers);
router.get("/members/:id", getMember);
router.patch("/members/:id", updateMember);
router.delete("/members/:id", requireRole("SUPER"), deleteMember);

router.get("/posts", adminPostController.getPosts);
router.get("/posts/:id", adminPostController.getPost);
router.put("/posts/:id", adminPostController.updatePost);
router.delete("/posts/:id", adminPostController.deletePost);

router.get("/logs/admin", requireRole("SUPER"), getAdminLogs);
router.get("/logs/users", getUserActivityLogs);

module.exports = router;
