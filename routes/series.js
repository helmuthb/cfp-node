const express = require('express');

const setup = (pool, passport) => {
    const router = express.Router();
    const seriesUtil = require('../util/series').setup(pool);
    const roleUtil = require('../util/role').setup(pool);

    // get all series - no authentication needed
    router.get('',
        async (req, res) => {
            const allSeries = await seriesUtil.getAllSeries();
            if (allSeries) {
                res.send({ allSeries });
            }
            else {
                res.status(500).send({ error: 'unknown error' });
            }
        }
    );

    // get one series by slug - no authentication needed
    router.get('/:slug',
        async (req, res) => {
            const slug = req.params.slug;
            const theSeries = await seriesUtil.getSeriesBySlug(slug);
            if (theSeries) {
                res.send({ message: 'ok', series: theSeries });
            }
            else {
                res.status(404).send({ error: 'series not found' });
            }
        }
    )

    // add a new series - authentication & role CREATOR needed
    router.post('',
        passport.authenticate('jwt', { session: false }),
        async (req, res) => {
            // check for permission
            const user = req.user;
            const hasRole = await roleUtil.hasRole(user.id, roleUtil.ROLE_CREATOR, '*');
            if (!hasRole) {
                res.status(403).send({ error: 'no right to create series' });
                return;
            }
            // check mandatory attributes
            const slug = req.body.slug;
            const title = req.body.title;
            if (!slug || !title) {
                res.status(400).send({ error: 'both slug and title are mandatory' });
                return;
            }
            // check if series already exists
            const exists = await seriesUtil.existsBySlugOrTitle(-1, slug, title);
            if (exists) {
                res.status(409).send({ error: 'series with this slug or title already exists' });
            }
            const newSeries = await seriesUtil.createSeries(req.body);
            if (newSeries && newSeries.id) {
                // add user as admin to series
                await roleUtil.addRole(user.id, roleUtil.ROLE_ADMIN, newSeries.id);
                res.send({ message: 'ok', series: newSeries });
            }
            else {
                res.status(500).send({ error: 'unknown error' });
            }
        }
    )

    // update a series - authentication & role EDITOR needed
    router.post('/:slug',
        passport.authenticate('jwt', { session: false }),
        async (req, res) => {
            const user = req.user;
            const oldSlug = req.params.slug;
            // get old series object
            const series = await seriesUtil.getSeriesBySlug(oldSlug);
            if (!series) {
                res.status(404).send({ error: 'series not found' });
                return;
            }
            // check authorization
            const hasRole = await roleUtil.hasRole(user.id, roleUtil.ROLE_EDITOR, series.id);
            if (!hasRole) {
                res.status(403).send({ error: 'not authorized to edit series' });
                return;
            }
            // can we change slug or title if requested?
            const slug = req.body.slug;
            const title = req.body.title;
            if (slug || title) {
                const exists = await seriesUtil.existsBySlugOrTitle(series.id, slug, title);
                if (exists) {
                    res.status(409)
                       .send({ error: 'series with slug or title already exists' });
                    return;
                }
            }
            // perform the update
            const updated = await seriesUtil.updateSeries(series.id, req.body);
            if (updated) {
                res.send({ message: 'ok', series: updated });
            }
            else {
                res.status(500).send({ error: 'unknown error' });
            }
        }
    )

    return router;

};

module.exports = { setup };
