const { body } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.registerValidators = [
    body('email')
        .isEmail()
        .withMessage('Enter correct email.')
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value });
                if (user) {
                    return Promise.reject(
                        'User with this email is already exist.'
                    );
                }
            } catch (error) {
                console.log(error);
            }
        })
        .normalizeEmail({
            gmail_remove_dots: false
        }),
    //isAlphanumeric - латинские символы, сиволы и буквы
    body('password', 'The password must be 6 or more characters.')
        .isLength({
            min: 6,
            max: 56
        })
        .isAlphanumeric()
        .trim(),
    body('confirm')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords must be same.');
            }
            return true;
        })
        .trim(),
    body('name', 'The name must be 3 or more characters.')
        .isLength({ min: 3 })
        .trim()
];

exports.loginValidator = [
    body('email')
        .isEmail()
        .withMessage('Enter correct email.')
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value });
                if (!user) {
                    return Promise.reject('No users with this email');
                }
            } catch (error) {
                console.log(error);
            }
        })
        .normalizeEmail({
            gmail_remove_dots: false
        }),
    body('password')
        .isLength({
            min: 6,
            max: 56
        })
        .withMessage('The password must be 6 or more characters.')
        .isAlphanumeric()
        .trim()
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: req.body.email });

                const areSame = await bcrypt.compare(value, user.password);
                if (!areSame) {
                    return Promise.reject('Incorrect password');
                }
            } catch (error) {
                console.log(error);
            }
        })
];

exports.courseValidators = [
    body('title')
        .isLength({ min: 3 })
        .withMessage('The title must be 3 or more characters.')
        .trim(),
    body('price').isNumeric().withMessage('Incorrect price value.'),
    body('img', 'Incorrect image URL.').isURL()
];
