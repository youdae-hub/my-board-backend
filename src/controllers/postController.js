const prisma = require("../lib/prisma");
const { logUserActivity } = require("../lib/logAction");

const getPosts = async (req, res) => {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { nickname: true } } },
  });

  res.json(posts);
};

const createPost = async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "제목과 내용을 입력해주세요." });
  }

  const post = await prisma.post.create({
    data: { title, content, userId: req.user.id },
  });

  logUserActivity({ userId: req.user.id, action: "CREATE_POST", target: "Post", targetId: post.id, ipAddress: req.ip }).catch(() => {});

  res.status(201).json(post);
};

const getPost = async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: Number(req.params.id) },
    include: { user: { select: { nickname: true } } },
  });

  if (!post) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  res.json(post);
};

const updatePost = async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!post) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  if (post.userId !== req.user.id) {
    return res.status(403).json({ message: "본인의 글만 수정할 수 있습니다." });
  }

  const { title, content } = req.body;
  const updated = await prisma.post.update({
    where: { id: Number(req.params.id) },
    data: { title, content },
  });

  logUserActivity({ userId: req.user.id, action: "UPDATE_POST", target: "Post", targetId: post.id, ipAddress: req.ip }).catch(() => {});

  res.json(updated);
};

const deletePost = async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!post) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  if (post.userId !== req.user.id) {
    return res.status(403).json({ message: "본인의 글만 삭제할 수 있습니다." });
  }

  await prisma.post.delete({ where: { id: Number(req.params.id) } });

  logUserActivity({ userId: req.user.id, action: "DELETE_POST", target: "Post", targetId: post.id, ipAddress: req.ip }).catch(() => {});

  res.json({ message: "게시글이 삭제되었습니다." });
};

module.exports = { getPosts, createPost, getPost, updatePost, deletePost };
