const jwt = require('jsonwebtoken');

const setup = (jwtKey) => {
    const signAndSend = (payload, res) => {
        jwt.sign(payload, jwtKey, { expiresIn: '30m' }, (err, token) => {
            if (err) {
                res.status(500).send({error: err});
            }
            else {
                res.send({message: 'ok', token: token});
            }
        });
    };

    return { signAndSend };
};

module.exports = { setup };