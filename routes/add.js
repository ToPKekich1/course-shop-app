const Course = require('../models/course');
const { Router } = require('express');
const router = Router();
const auth = require('../middleware/auth');
const { courseValidators } = require('../utils/validators');
const { validationResult } = require('express-validator');

router.get('/', auth, (_req, res) => {
    res.render('add', {
        title: 'Add course',
        isAdd: true
    });
});

router.post('/', auth, courseValidators, async (req, res) => {
    const { title, price, img } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('add', {
            title: 'Add course',
            isAdd: true,
            error: errors.errors[0].msg,
            data: { title, price, img }
        });
    }

    const course = new Course({
        title,
        price,
        img,
        userId: req.user
    });

    try {
        await course.save();
        res.redirect('/courses');
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
