const { Router } = require('express');
const User = require('../models/user');
const router = Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
const keys = require('../keys');
const regEmail = require('../email/registration');
const resetEmail = require('../email/reset');
const { validationResult } = require('express-validator');
const { registerValidators, loginValidator } = require('../utils/validators');

sgMail.setApiKey(keys.SENDGRID_API_KEY);

router.get('/login', async (req, res) => {
    try {
        res.render('auth/login', {
            title: 'Login',
            isLogin: true,
            loginError: req.flash('loginError'),
            registerError: req.flash('registerError')
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/logout', async (req, res) => {
    try {
        req.session.destroy(() => {
            res.redirect('/auth/login#login');
        });
    } catch (error) {
        console.log(error);
    }
    //метод для уничтожения данных сессии, а колбек будет вызван после
});

router.post('/login', loginValidator, async (req, res) => {
    try {
        const { email } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash('loginError', errors.errors[0].msg);
            //422 - ошибка валидации
            return res.status(422).redirect('/auth/login#login');
        }

        const user = await User.findOne({ email });

        req.session.user = user;
        req.session.isAuthenticated = true;
        req.session.save(err => {
            if (err) {
                throw err;
            }
            res.redirect('/');
        });
    } catch (error) {
        console.log(error);
    }
});

router.post('/register', registerValidators, async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('registerError', errors.errors[0].msg);
            //422 - ошибка валидации
            return res.status(422).redirect('/auth/login#registration');
        }

        //hash возвращает промис
        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            password: hashPassword,
            name,
            cart: { items: [] }
        });
        await user.save();
        req.session.user = user;
        req.session.isAuthenticated = true;
        res.redirect('/');
        sgMail.send(regEmail(email));
    } catch (error) {
        console.log(error);
    }
});

router.get('/reset', (req, res) => {
    try {
        res.render('auth/reset', {
            title: 'Forgot password',
            error: req.flash('error')
        });
    } catch (error) {
        console.log(error);
    }
});

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Something went wrong! Try again letter.');
                return res.redirect('/auth/reset');
            }
            const token = buffer.toString('hex');
            const candidate = await User.findOne({ email: req.body.email });

            if (candidate) {
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
                await candidate.save();
                sgMail.send(resetEmail(candidate.email, token));
                res.redirect('/auth/login#login');
            } else {
                req.flash('error', 'No users with this email.');
                return res.redirect('/auth/reset');
            }
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/login');
    }
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: { $gt: Date.now() }
        });

        if (!user) {
            return res.redirect('/auth/login');
        } else {
            res.render('auth/password', {
                title: 'New password',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token
            });
        }
    } catch (error) {
        console.log(error);
    }
});

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            //greater then
            resetTokenExp: { $gt: Date.now() }
        });

        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();
            res.redirect('/auth/login');
        } else {
            req.flash('loginError', 'Time to change the password expired.');
            res.redirect('/auth/login');
        }
    } catch (error) {
        console.log(object);
    }
});

module.exports = router;
