const PORT = process.env.PORT || 5000;
const keys = require('./keys');
const express = require('express');
const app = express();
const flash = require('connect-flash');
const exphbs = require('express-handlebars');
const homeRoutes = require('./routes/home');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const Handlebars = require('handlebars');
const {
    allowInsecurePrototypeAccess
} = require('@handlebars/allow-prototype-access');
const varMiddleWare = require('./middleware/variables');
//данный require возвращает функцию которую мы должны вызвать и передать наш пакет для синхронизации, и потом
//вернет класс который мы можем использовать
const MongoStore = require('connect-mongodb-session')(session);
const userMiddleware = require('./middleware/user');
const csrf = require('csurf');
const errorHandler = require('./middleware/error');
const fileMiddleware = require('./middleware/file');
const helmet = require('helmet');
const compression = require('compression');
const store = new MongoStore({
    //секцию которая будет хранить сессиии
    collection: 'sessions',
    uri: keys.MONGODB_URI
});

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: require('./utils/hbs-helpers')
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }));
//Файлы в статик папках доступны также по корневому пути
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
    session({
        secret: keys.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store
    })
);
app.use(fileMiddleware.single('avatar'));

app.use(csrf());
app.use(flash());
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                'default-src': ["'self'"],
                'script-src': ["'self'", 'https:'],
                'object-src': ["'none'"],
                'img-src': ["'self'", 'https:'],
                'style-src': ["'self'", 'https:']
            }
        }
    })
);
app.use(compression());
app.use(varMiddleWare);
app.use(userMiddleware);
app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
//Error подключаем вконце ибо некоторые роуты нам будут недоступны
app.use(errorHandler);

const start = async () => {
    try {
        await mongoose.connect(keys.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });
        app.listen(PORT, () => {
            console.log('Server is running on port ' + PORT);
        });
    } catch (error) {
        console.log(error);
    }
};

start();
