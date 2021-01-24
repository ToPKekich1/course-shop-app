const keys = require('../keys');

module.exports = function (to, token) {
    console.log(`${keys.BASE_URL}/auth/password/${token}`);
    return {
        to,
        from: keys.EMAIL_FROM,
        subject: 'Reset password',
        html: `
        <h1>Forgot password?</h1>
        <p>Follow the link bellow</p>
        <p><a href="${keys.BASE_URL}/auth/password/${token}">Reset password</a></p>
        <p>If it wasn't you, just ignore this message.</p>
        <hr/>
        <a href="${keys.BASE_URL}">Course shop</a>
        `
    };
};
