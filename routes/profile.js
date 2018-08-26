const express = require('express');

const setup = (pool, passport) => {
    const router = express.Router();
    const profileUtil = require('../util/profile').setup(pool);

    router.get(
        '',
        passport.authenticate('jwt', { session: false }),
        async (req, res) => {
            const userId = req.user.id;
            const profile = await profileUtil.getProfile(userId);
            if (profile) {
                res.send({ profile });
            }
            else {
                res.status(500).send({ error: 'unknown error' });
            }
        }
    );

    router.post(
        '',
        passport.authenticate('jwt', { session: false }),
        async (req, res) => {
            const userId = req.user.id;
            const firstName = req.body.firstName;
            const lastName = req.body.lastName;
            const bio = req.body.bio;
            const comments = req.body.comments;
            await profileUtil.updateProfile(userId, firstName, lastName, bio, comments);
            const profile = await profileUtil.getProfile(userId);
            if (profile) {
                res.send({ profile });
            }
            else {
                res.status(500).send({ error: 'unknown error' });
            }
        }
    );

    return router;
};

module.exports = { setup };