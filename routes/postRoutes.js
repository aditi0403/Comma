const express = require('express');
const { getPostForm, createPost, getPosts, getPostById, getEditPostForm, updatePost, deletePost } = require('../controllers/postController');
const upload = require('../config/multer');
const { ensureAuthenticated } = require('../middlewares/auth');
const postRouter = express.Router();

postRouter.get('/add', getPostForm);

postRouter.post('/add', ensureAuthenticated, upload.array('images', 5),  createPost);

postRouter.get('/', getPosts)

postRouter.get('/:id', getPostById);
postRouter.get('/:id/edit', getEditPostForm);
postRouter.put('/:id', ensureAuthenticated, upload.array('images', 5), updatePost)
postRouter.delete('/:id', ensureAuthenticated, deletePost);


module.exports = postRouter;
