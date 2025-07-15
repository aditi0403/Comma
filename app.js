const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const passportConfig = require('./config/passport');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const session = require('express-session');
const postRouter = require('./routes/postRoutes');
const errorHandler = require('./middlewares/errorHandler');
const commentRouter = require('./routes/commentRoutes');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
require('dotenv').config();

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}))

passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(methodOverride('_method'));

const port = 5000;
app.get('/', (req, res) => {
    res.render('home', {
        title: 'Comma',
        user: req.user,
        error: "",
        bodyClass: "home-page" 
    });
})
app.use('/auth', authRouter);
app.use('/posts', postRouter);
app.use('/', commentRouter)
app.use('/user', userRouter)

app.use(errorHandler)

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 20000 // 20 seconds
})
.then(() => {
    app.listen(port, () => {
        console.log('db connected');
        console.log(`Server is running on port ${port}`);
    });
})
.catch((error) => {
    console.log(error);
});

