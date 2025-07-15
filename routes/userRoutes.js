const express = require('express');
const { getUserProfile, getEditProfileForm, updateProfile, deleteAccount } = require('../controllers/userController');
const { ensureAuthenticated } = require('../middlewares/auth');
const upload = require('../config/multer');
const userRouter = express.Router();

userRouter.get('/profile', ensureAuthenticated, getUserProfile);
userRouter.get('/edit', ensureAuthenticated, getEditProfileForm);
userRouter.post('/edit', ensureAuthenticated, upload.single('profilePicture'), updateProfile);
userRouter.post('/delete', ensureAuthenticated, deleteAccount)

module.exports = userRouter;