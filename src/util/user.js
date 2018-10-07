const sendmail = require("../sendmail");
const passwordReset = require("../templates/passwordReset");
const passwordChanged = require("../templates/passwordChanged");
const welcome = require("../templates/welcome");
const uuid = require("uuid/v4");
const bcrypt = require("bcrypt");
const config = require("../config");

const generateHash = password =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
const verifyHash = (password, passwordHash) =>
  bcrypt.compareSync(password, passwordHash);

const checkPasswordQuality = password => {
  // at least 8 character password length
  return password.length > 6;
};

const getUserForEmail = async (pool, email) => {
  const emailLowerCase = email.toLowerCase();
  const res = await pool.query('select * from "user" where email = $1', [
    emailLowerCase
  ]);
  if (res.rows.length > 0) {
    return res.rows[0];
  }
  // no user found -> false
  return false;
};

const getUserForId = async (pool, id) => {
  const res = await pool.query('select * from "user" where id = $1', [id]);
  if (res && res.rows && res.rows.length == 1) {
    return res.rows[0];
  }
  return false;
};

const activateUser = async (pool, id) => {
  await pool.query(
    'update "user" ' +
      " set activation_key=null, updated_at=now()" +
      " where id = $1",
    [id]
  );
};

const verifiedUser = async (pool, email, password, activation_key) => {
  if (!password) {
    return false;
  }
  const user = await getUserForEmail(pool, email);
  if (user && verifyHash(password, user.password)) {
    // user found, and password is correct
    if (!user.activation_key || user.activation_key == activation_key) {
      // either no activation required, or correct key provided
      if (user.activation_key) {
        // activate user if not done yet
        await activateUser(pool, user.id);
      }
      return user;
    }
  }
  // all other cases: not authenticated
  return false;
};

module.exports = {
  getUserForEmail,
  getUserForId,
  activateUser,
  generateHash,
  verifyHash,
  verifiedUser,
  createUser: async (pool, email, password, first_name, last_name) => {
    let user = await getUserForEmail(pool, email);
    if (user) {
      return {
        code: 400,
        content: { error: "Email address already registered" }
      };
    }
    const res = await pool.query(
      'insert into "user" ' +
        "(first_name, last_name, email, password, activation_key) " +
        "values ($1, $2, $3, $4, $5) returning *",
      [
        first_name,
        last_name,
        email.toLowerCase(),
        generateHash(password),
        uuid()
      ]
    );
    if (res && res.rows && res.rows.length == 1) {
      sendmail(res.rows[0], welcome);
      return {
        code: 200,
        content: {
          message: "User created, please activate account via link in email"
        }
      };
    }
    return { code: 500, content: { error: "Unknown error" } };
  },
  requestPasswordReset: async (pool, email) => {
    const user = await getUserForEmail(pool, email);
    if (!user) {
      return { code: 200, content: { message: "No details to report" } };
    }
    const lastChanged = Date.now() - user.updated_at.getTime();
    // Do nothing if last change was just now
    if (lastChanged < config.resetPassword.minChangedTime) {
      return {
        code: 429,
        content: { error: "User modified too recently" }
      };
    }
    // Re-create reset token if too old
    const expired = Date.now() - config.resetPassword.expiration;
    if (!user.reset_time || user.reset_time.getTime() < expired) {
      user.reset_time = new Date();
      user.reset_key = uuid();
      await pool.query(
        "update user " +
          " set reset_key = $2, reset_time = $3, updated_at = now() " +
          " where email = $1",
        [user.email, user.reset_key, user.reset_time]
      );
    } else {
      await pool.query("update user set updated_at = now()", [user.email]);
    }
    // send mail with info to reset password
    sendmail(user, passwordReset);
    return { code: 200, content: { message: "No details to report" } };
  },
  performPasswordReset: async (pool, email, reset_key, new_password) => {
    if (!checkPasswordQuality(new_password)) {
      return { code: 400, content: { error: "Password too simple" } };
    }
    const user = getUserForEmail(pool, email);
    if (!user) {
      return { code: 401, content: { error: "User or reset key not found" } };
    }
    // check the password reset key
    const expired = Date.now() - config.resetPassword.expiration;
    if (
      user.reset_time &&
      user.reset_time > expired &&
      user.reset_key &&
      user.reset_key === reset_key
    ) {
      // perform password reset
      await pool.query(
        'update "user" set password = $2, updated_at = now() where id = $1',
        [user.id, generateHash(new_password)]
      );
      sendmail(user, passwordChanged);
      return { code: 200, content: { message: "Password reset successfully" } };
    }
  },
  updatePassword: async (pool, user, password, new_password) => {
    if (!verifyHash(password, user.password)) {
      return { code: 401, content: { error: "Old password is not correct" } };
    }
    if (!checkPasswordQuality(new_password)) {
      return { code: 400, content: { error: "Password too simple" } };
    }
    await pool.query(
      'update "user" set password = $2, updated_at = now() where id = $1',
      [user.id, generateHash(new_password)]
    );
    sendmail(req.user, passwordChanged);
    return { code: 200, content: { message: "Password has been updated" } };
  }
};
