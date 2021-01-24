const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
    try {
        res.status(200).render('index', {
            title: 'Home page',
            isHome: true
        });
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
