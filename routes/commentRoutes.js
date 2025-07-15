const express = require('express');
const { ensureAuthenticated } = require('../middlewares/auth');
const { addComment, deleteComment } = require('../controllers/commentController');
const commentRouter = express.Router();

commentRouter.post('/posts/:id/comments', ensureAuthenticated, addComment)
commentRouter.delete('/comments/:id', ensureAuthenticated, deleteComment)

module.exports = commentRouter;