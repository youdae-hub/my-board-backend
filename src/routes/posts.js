const express = require("express");
const { getPosts, createPost, getPost, updatePost, deletePost } = require("../controllers/postController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/", getPosts);
router.post("/", authMiddleware, createPost);
router.get("/:id", getPost);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;
