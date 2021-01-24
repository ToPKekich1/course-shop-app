const keys = require('../keys');

module.exports = function (to) {
    return {
        to,
        from: keys.EMAIL_FROM,
        subject: 'Account was created',
        html: `
        <h1>Welcome to our shop.</h1>
        <p>You succsessfuly create account with email - ${to}</p>
        <hr/>
        <a href="${keys.BASE_URL}">Course shop</a>
        `
    };
};
