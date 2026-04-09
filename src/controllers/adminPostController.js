const prisma = require("../lib/prisma");
const { logAdminAction } = require("../lib/logAction");

const getPosts = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search;

  const where = search
    ? { OR: [{ title: { contains: search } }, { content: { contains: search } }] }
    : {};

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { user: { select: { nickname: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  res.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
};

const getPost = async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: Number(req.params.id) },
    include: { user: { select: { nickname: true, email: true } } },
  });

  if (!post) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  res.json(post);
};

const updatePost = async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: Number(req.params.id) } });
  if (!post) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  const { title, content } = req.body;
  const updated = await prisma.post.update({
    where: { id: Number(req.params.id) },
    data: { title, content },
  });

  logAdminAction({ adminId: req.admin.id, action: "UPDATE_POST", target: "Post", targetId: Number(req.params.id), ipAddress: req.ip }).catch(() => {});

  res.json(updated);
};

const deletePost = async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: Number(req.params.id) } });
  if (!post) {
    return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  }

  await prisma.post.delete({ where: { id: Number(req.params.id) } });

  logAdminAction({ adminId: req.admin.id, action: "DELETE_POST", target: "Post", targetId: Number(req.params.id), ipAddress: req.ip }).catch(() => {});

  res.json({ message: "게시글이 삭제되었습니다." });
};

module.exports = { getPosts, getPost, updatePost, deletePost };
