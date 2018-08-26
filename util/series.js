const camelCase = require('camelcase-keys');
const debug = require('debug')('seriesUtil');

const sqlById = 'select * from "series" where id=$1';
const sqlBySlug = 'select * from "series" where slug=$1';
const sqlBySlugOrTitle = `
  select * from "series" where (slug=$2 or title=$3) and id <> $1`;
const sqlAddSeries = `
  insert into "series" (slug, title, details, link, logo_link)
  values ($1, $2, $3, $4, $5)
  returning *`;
const sqlUpdateSeries = `
  update "series" set slug=$2, title=$3, details=$4, link=$5, logo_link=$6
  where id = $1`;
const sqlAllSeries = 'select * from "series"';

const setup = (pool) => {
    const createSeries = async (props) => {
        if (!props || !props.slug || !props.title) {
            return false;
        }
        const res = await pool.query(sqlAddSeries,
            [props.slug, props.title, props.details, props.link, props.logoLink]);
        if (res && res.rows[0]) {
            return camelCase(res.rows[0]);
        }
        return false;
    };

    const getSeriesBySlug = async (slug) => {
        const res = await pool.query(sqlBySlug, [slug]);
        if (res && res.rows[0]) {
            return camelCase(res.rows[0]);
        }
        return false;
    };

    const existsBySlugOrTitle = async (id, slug, title) => {
        const res = await pool.query(sqlBySlugOrTitle, [id, slug, title]);
        return (res && res.rows[0]) ? true : false;
    };

    const getAllSeries = async () => {
        const res = await pool.query(sqlAllSeries);
        let series = [];
        if (res) {
            for (let i=0; i<res.rows.length; i++) {
                series.push(camelCase(res.rows[i]));
            }
        }
        return series;
    };

    const updateSeries = async (id, props) => {
        // find old series
        let res = await pool.query(sqlById, [id]);
        if (!res || !res.rows[0]) {
            return false;
        }
        const series = camelCase(res.rows[0]);
        Object.assign(series, props);
        res = await pool.query(sqlUpdateSeries,
            [id, series.slug, series.title, series.details,
            series.link, series.logo_link]);
        // get updated object
        res = await pool.query(sqlById, [id]);
        if (res && res.rows[0]) {
            return camelCase(res.rows[0]);
        }
        return false;        
    };

    return { createSeries, getSeriesBySlug, existsBySlugOrTitle, getAllSeries,
        updateSeries };
};

module.exports = { setup };
