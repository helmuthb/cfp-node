const bcrypt = require('bcrypt');
const crypto = require('crypto');
const camelCase = require('camelcase-keys');
const debug = require('debug')('userUtil');

const verifyHash = (password, hash) => bcrypt.compare(password, hash);
const calcHash = (password) => bcrypt.hash(password, 10);
const getRandom = () => new Promise((resolve, reject) =>
    crypto.randomBytes(10, (err, buf) =>
      err ? reject(err) : resolve(buf.toString('hex'))
    )
  );

const stripUser = (user) => {
    const { id, firstName, lastName, email, createdAt, updatedAt } = user;
    return { id, firstName, lastName, email, createdAt, updatedAt };
}

const RESET_TIMEOUT = 2 * 3600 * 1000; // two hours
const sqlById = 'select * from "user" where id=$1';
const sqlByEmail = 'select * from "user" where email=$1';
const sqlAddUser = `
      insert into "user"
        (first_name, last_name, email, password_hash, activation_key)
      values ($1, $2, $3, $4, $5) returning *`;
const sqlSetActivation = `
      update "user" set activation_key=null, updated_at=now()
      where id = $1`;
const sqlAddReset = `
      update "user" set reset_key=$2, reset_time=now(), updated_at=now()
      where id = $1`;
const sqlChangePassword = `
      update "user" set password_hash=$2, reset_key=null, reset_time=null, updated_at=now()
      where id = $1`;

const setup = (pool) => {
    const OK = 1;
    const USER_ALREADY_REGISTERED = 0;
    const USER_ATTRIBUTES_MISSING = -1;

    const getUserById = async (id) => {
        const res = await pool.query(sqlById, [id]);
        return stripUser(camelCase(res.rows[0]));
    }

    const getUserByEmail = async (email) => {
        const res = await pool.query(sqlByEmail, [email]);
        return camelCase(res.rows[0]);
    }

    const verifyLogin = async (email, password) => {
        if (!email || !password) {
            return false;
        }
        const user = await getUserByEmail(email);
        const match = await verifyHash(password, user.passwordHash);
        if (user && !user.activationKey) {
            return match && user;
        }
        return false;
    };

    const requestReset = async (email) => {
        if (!email) {
            return;
        }
        const user = await getUserByEmail(email);
        if (!user) {
            // user not found
            return;
        }
        if (user.resetTime != null) {
            // old reset request found
            const timeDelta = Date.now() - user.resetTime.getTime();
            if (timeDelta < 60 * 1000) {
                // too frequent request
                return;
            }
        }
        const resetKey = await getRandom();
        await pool.query(sqlAddReset, [user.id, resetKey]);
        // TODO: send email with reset key
        debug('ResetKey: ' + resetKey);
    };

    const resetLogin = async (email, password, resetKey) => {
        if (!email || !password || !resetKey) {
            return false;
        }
        const user = await getUserByEmail(email);
        if (!user || !user.resetKey || !user.resetTime) {
            return false;
        }
        const matchKey = user.resetKey === resetKey;
        debug("user.resetTime", user.resetTime);
        debug("user", user);
        const timeDelta = Date.now() - user.resetTime.getTime();
        if (timeDelta < RESET_TIMEOUT && matchKey) {
            const passwordHash = await calcHash(password);
            await pool.query(sqlChangePassword, [user.id, passwordHash]);
            return true;
        }
        return false;
    }

    const activateUser = async (email, password, activationKey) => {
        if (!email || !password || !activationKey) {
            return false;
        }
        const user = await getUserByEmail(email);
        const matchPasswd = await verifyHash(password, user.passwordHash);
        const matchKey = user.activationKey === activationKey;
        if (user && user.activationKey && matchPasswd && matchKey) {
            await pool.query(sqlSetActivation, [user.id]);
            // TODO: send welcome email
            return stripUser(user);
        }
        return false;
    };

    const registerUser = async (email, password, firstName, lastName) => {
        if (!email || !password || !firstName || !lastName) {
            return USER_ATTRIBUTES_MISSING;
        }
        const user = await getUserByEmail(email);
        if (user) {
            return USER_ALREADY_REGISTERED;
        }
        const passwordHash = await calcHash(password);
        const activationKey = await getRandom();
        await pool.query(sqlAddUser,
            [firstName, lastName, email, passwordHash, activationKey]);
        // TODO: send email with activation link
        debug('Activation Key: ' + activationKey);
        return OK;
    };

    const changePassword = async (email, oldPassword, newPassword) => {
        if (!email || !oldPassword || !newPassword) {
            return false;
        }
        const user = await getUserByEmail(email);
        const matchPasswd = await verifyHash(oldPassword, user.passwordHash);
        if (user && matchPasswd) {
            await pool.query(sqlChangePassword, [user.id, newPassword]);
            return true;
        }
        return false;
    };

    return { OK, USER_ALREADY_REGISTERED, USER_ATTRIBUTES_MISSING,
             getUserById,
             verifyLogin, activateUser, registerUser, requestReset,
             resetLogin, changePassword };
};

module.exports = { setup };