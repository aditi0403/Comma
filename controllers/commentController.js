const asyncHandler = require("express-async-handler");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

exports.addComment = asyncHandler(async(req, res) => {
    const { content } = req.body;
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) {
        return res.render('postDetails', {
            title: 'Post',
            post,
            user: req.user,
            error: 'Post not found',
            succrss: ""   
        })
    }

    if (!content) {
        return res.render('postDetails', {
            title: 'Post',
            post,
            user: req.user,
            error: 'Comment content cannot be empty',
            succrss: ""   
        });
    }

    const comment = new Comment({
        content,
        post: postId,
        author: req.user._id
    })
    await comment.save();
    post.comments.push(comment._id);
    await post.save();

    res.redirect(`/posts/${postId}`);
})

exports.deleteComment = asyncHandler(async(req, res) => {
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId).populate('post');

    if (!comment) {
        return res.render('postDetails', {
            title: 'Post',
            post: null,
            user: req.user,
            error: 'Comment not found',
            succrss: ""   
        });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
        return res.status(403).render('postDetails', {
            title: 'Post',
            post: comment.post,
            user: req.user,
            error: 'You are not authorized to delete this comment',
            succrss: ""   
        });
    }

    await Comment.findByIdAndDelete(commentId);
    comment.post.comments.pull(commentId);
    await comment.post.save();

    res.redirect(`/posts/${comment.post._id}`);
});