const asyncHandler = require('express-async-handler');
const Post = require("../models/Post");
const File = require("../models/File");
const cloudinary = require('../config/cloudinary');

exports.getPostForm = (req, res) => {
    res.render('newPost', { 
        title: 'post', 
        user: req.user,
        error: "",
        success: ""
     });
}

exports.createPost = asyncHandler(
    async (req, res) => {
    const {title, content} = req.body;
    if (!title || !content || title.trim() === "" || content.trim() === "") {
        throw new Error("Title and Content are required.");
    }
    if (req.files && req.files.length > 5) {
        throw new Error("You can only upload a maximum of 5 images.");
    }
  
     let images = []; // Initialize an empty array

    // Only process images if they exist
    if (req.files && req.files.length > 0) {
        images = await Promise.all(
            req.files.map(async (file) => {
                // Save image info to File model (optional)
                const newFile = new File({
                    url: file.path,
                    public_id: file.filename,
                    uploaded_by: req.user._id
                });
                await newFile.save();

                // Return the structure to store in Post model
                return {
                    url: file.path,
                    public_id: file.filename
                };
            })
        );
    }

    const newPost = new Post({
        title,
        content,
        images,
        author: req.user._id
    });
    await newPost.save();

    res.render('newPost', { 
        title: 'Create Post', 
        user: req.user ,
        success: 'Post created successfully',
        error: ""
    });   
    
}
)

exports.getPosts = asyncHandler(
    async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 }).populate('author', 'username')
    res.render('posts', { 
        title: 'Posts', 
        user: req.user,
        posts,
        error: "",
        success: ""
    });
}
)

exports.getPostById = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id).populate('author', 'username').populate({
        path: 'comments',
        populate: {
            path: 'author',
            model: 'User',
            select: 'username'
        }
    })
    res.render('postDetails', {
        title: post.title,
        user: req.user,
        post,
        error: "",
        success: ""
    })
})

exports.getEditPostForm = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        res.render('editPost', {
            title: 'Post',
            user: req.user,
            post: null,
            error: "Post not found",
            success: ""
        });
    }
    res.render('editPost', {
        title: 'Edit Post',
        user: req.user,
        post,
        error: "",
        success: ""
    });
})

exports.updatePost = asyncHandler(async (req, res) => {
    const { title, content, deleteImages } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.render('postDetails', { 
            title: 'Post',
            user: req.user,
            post: null,
            error: "Post not found",
            success: ""
        });
    }

    if (post.author.toString() !== req.user._id.toString()) {
        return res.render('postDetails', { // Use return to stop execution
            title: 'Post',
            user: req.user,
            post,
            error: "You are not authorized to edit this post",
            success: ""
        });
    }
    
    post.title = title || post.title;
    post.content = content || post.content;

    let updatedImages = [...post.images];

    // Handle image deletions
    if (deleteImages && deleteImages.length > 0) {
        const imagesToDelete = Array.isArray(deleteImages) ? deleteImages : [deleteImages];

        await Promise.all(imagesToDelete.map(async (publicIdToDelete) => {
            await cloudinary.uploader.destroy(publicIdToDelete);
            updatedImages = updatedImages.filter(img => img.public_id !== publicIdToDelete);
            updatedImages = updatedImages.filter(img => img.public_id !== publicIdToDelete);
        }));
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
        if (updatedImages.length + req.files.length > 5) {
            throw new Error("You can only have a maximum of 5 images per post.");
        }

        const newUploadedImages = await Promise.all(
            req.files.map(async (file) => {
                const newFile = new File({
                    url: file.path,
                    public_id: file.filename,
                    uploaded_by: req.user._id
                });
                await newFile.save();
                return {
                    url: newFile.url,
                    public_id: newFile.public_id
                };
            })
        );
        updatedImages = [...updatedImages, ...newUploadedImages];
    }

    post.images = updatedImages;

    await post.save();

    res.redirect(`/posts/${post._id}`); 
});
exports.deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        res.render('postDetails', {
            title: 'Post',
            user: req.user,
            post,
            error: "Post not found",
            success: ""
        });
    }

    if (post.author.toString() !== req.user._id.toString()) {
        res.render('postDetails', {
            title: 'Post',
            user: req.user,
            post,
            error: "You are not authorized to delete this post",
            success: ""
        });
    }

    await Promise.all(post.images.map(async (image) => {
        await cloudinary.uploader.destroy(image.public_id);
    }));

    await Post.findByIdAndDelete(req.params.id);

    res.redirect('/posts');
})