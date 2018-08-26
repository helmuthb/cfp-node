const camelCase = require('camelcase-keys');
const debug = require('debug')('profileUtil');

const sqlById = 'select * from "profile" where user_id=$1';
const sqlUpdateUser = `
  update "user" set first_name=$2, last_name=$3, updated_at=now() where id=$1`;
const sqlUpdateProfile = `
  update "profile" set bio=$2, comments=$3, updated_at=now() where user_id=$1`;
const sqlCreateProfile = `
  insert into "profile" (user_id, bio, comments) values ($1, $2, $3)`;

const setup = (pool) => {
    const userUtil = require('./user').setup(pool);

    const getPureProfile = async (id) => {
        const res = await pool.query(sqlById, [id]);
        let profile = {};
        if (res && res.rows[0]) {
            profile = camelCase(res.rows[0]);
        }
        return profile;
    };

    const getProfile = async (id) => {
        const profile = await getPureProfile(id);
        const user = await userUtil.getUserById(id);
        // return combined object
        return Object.assign(profile, user);
    };

    const updateProfile = async (id, firstName, lastName, bio, comments) => {
        const user = await userUtil.getUserById(id);
        const profile = await getPureProfile(id);
        const fnChanged = firstName && firstName !== user.firstName;
        const lnChanged = lastName && lastName !== user.lastName;
        const bioChanged = bio && (bio !== profile.bio);
        const cmtChanged = comments && (comments !== profile.comments);
        if (fnChanged || lnChanged) {
            if (!fnChanged) {
                firstName = user.firstName;
            }
            if (!lnChanged) {
                lastName = user.lastName;
            }
            await pool.query(sqlUpdateUser, [id, firstName, lastName]);
        }
        if (bioChanged || cmtChanged) {
            if (!bioChanged) {
                bio = profile.bio || '';
            }
            if (!cmtChanged) {
                comments = profile.comments || '';
            }
            if (profile.id) {
                await pool.query(sqlUpdateProfile, [id, bio, comments]);
            }
            else {
                await pool.query(sqlCreateProfile, [id, bio, comments]);
            }
        }
    };

    return { getProfile, updateProfile };
};

module.exports = { setup };
