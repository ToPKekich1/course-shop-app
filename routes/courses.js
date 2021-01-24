const { Router } = require('express');
const Course = require('../models/course');
const auth = require('../middleware/auth');
const router = Router();
const { courseValidators } = require('../utils/validators');
const { validationResult } = require('express-validator');

function isOwner(course, req) {
    return course.userId.toString() === req.user._id.toString();
}

router.get('/', async (req, res) => {
    try {
        //useId вместо того чтобы быть идентификатором является объектом где хранятся все данные по пользователю
        // const courses = await Course.find().populate('userId');
        const courses = await Course.find()
            //конкретно какие поля вытягиваем
            .populate('userId', 'email name')
            .select('price title img');
        const fixedCourses = courses.map(i => i.toObject());
        res.status(200).render('courses', {
            title: 'Courses',
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            courses: fixedCourses
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        res.render('course', {
            layout: 'empty',
            title: `Course ${course.title}`,
            course: course.toObject()
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/:id/edit', auth, async (req, res) => {
    try {
        if (!req.query.allow) {
            return res.redirect('/');
        }
        const course = await Course.findById(req.params.id);

        if (!isOwner(course, req)) {
            return res.redirect('/courses');
        }
        res.render('course-edit', {
            title: `Edit the ${course.title} course`,
            course: course.toObject()
        });
    } catch (error) {
        console.log(error);
    }
});

router.post('/remove', auth, async (req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        });
        res.redirect('/courses');
    } catch (error) {
        console.log(error);
    }
});

router.post('/edit', auth, courseValidators, async (req, res) => {
    try {
        const errors = validationResult(req);
        const { id } = req.body;

        if (!errors.isEmpty()) {
            return res.status(422).redirect(`/courses/${id}/edit?allow=true`);
        }

        delete req.body.id;
        const course = await Course.findById(id);

        if (!isOwner(course, req)) {
            return res.redirect('/courses');
        }
        Object.assign(course, req.body);
        await course.save();

        res.redirect('/courses');
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
