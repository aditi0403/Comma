const passport = require("passport");
const User = require("../models/User");
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');

exports.getLogin = (req, res) => {
    res.render('login', {
        title: 'login',
        user: req.user,
        error: ""
    });
};

exports.getRegister = (req, res) => {
    res.render('register', { 
        title: 'register',
        user: req.user,
        error: ""
    });
};

exports.login = asyncHandler(async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.render('login', {
                title: 'login',
                user: req.user,
                error: info.message
            });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect('/user/profile');
        });
    })(req, res, next);
});

exports.register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.render('register', {
            title: 'register',
            user: req.user,
            error: 'Email already exists'
        });
    } 
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        username,
        email,
        password: hashedPassword
    });

    res.redirect('/auth/login');
});

exports.logout = asyncHandler(async (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/auth/login');
    });
});
