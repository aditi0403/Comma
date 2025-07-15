const asyncHandler = require("express-async-handler");
const Post = require("../models/Post");
const User = require("../models/User");
const File = require("../models/File");
const cloudinary = require("../config/cloudinary");
const Comment = require("../models/Comment");

 

exports.getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
        return res.render('login', {
            title: 'Login',
            error: 'User not found',
            user: req.user,
            success: ""
        })
    }

    const posts = await  Post.find({ author: req.user._id}).sort({ createdAt: -1 });
    res.render('profile', {
        title: 'Profile',
        user,
        posts,
        error: "",
        success: "",
        postCount: posts.length
    });
})    

exports.getEditProfileForm = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
        return res.render('login', {
            title: 'Login',
            error: 'User not found',
            user: req.user,
            success: ""
        })
    }
    res.render('editProfile', {
        title: 'Edit Profile',
        user,
        error: "",
        success: ""
    });
})

exports.updateProfile = asyncHandler(async (req, res) => { 
    const { username, email, pronouns, bio } = req.body;
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
        return res.render('login', {
            title: 'Login',
            error: 'User not found',
            user: req.user,
            success: ""
        })
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.pronouns = pronouns || user.pronouns;
    user.bio = bio || user.bio; 

    if (req.file) {
        if (user.profilePicture && user.profilePicture.public_id) {
            await cloudinary.uploader.destroy(user.profilePicture.public_id);
        }
        const file = new File({
            url: req.file.path,
            public_id: req.file.filename,
            uploadedBy: user._id
        });
        await file.save();
        user.profilePicture = {
            url: file.url,
            public_id: file.public_id
        };
    }


    await user.save();

    const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.render('profile', {
        title: 'Profile',
        user,
        error: "",
        success: "Profile updated successfully",
        posts,
        postCount: posts.length
    });
})

exports.deleteAccount = asyncHandler(async (req, res) => { 
    const user = await User.findById(req.user._id);
    if (!user) {
        return res.render('login', {
            title: 'Login',
            error: 'User not found',
            user: req.user,
            success: ""
        })
    }

    if (user.profilePicture && user.profilePicture.public_id) {
        await cloudinary.uploader.destroy(user.profilePicture.public_id);
    }    

    const posts = await Post.find({ author: req.user._id});
    for (const post of posts) {
        for (const image of post.images) {
            await cloudinary.uploader.destroy(image.public_id);
        }
        await Comment.deleteMany({ post: post._id});
        await Post.findByIdAndDelete(post._id);
    }

    await Comment.deleteMany({ author: req.user._id });

    const files = await File.find({ uploadedBy: req.user._id });
    for (const file of files) {
        await cloudinary.uploader.destroy(file.public_id);
    }

    await User.findByIdAndDelete(req.user._id);
    res.redirect('/auth/register');
})
    