const camelCase = require('camelcase-keys');
const debug = require('debug')('roleUtil');

const ROLE_ADMIN = "admin";
const ROLE_EDITOR = "editor";
const ROLE_CREATOR = "creator";
const ROLE_REVIEWER = "reviewer";
const ROLE_MENTOR = "mentor";

const str2list = (object) => {
    let list = [object];
    const parts = object.split(':');
    for (let i=parts.length-1; i>0; i--) {
       if (parts[i] !== '*') {
           list.push(parts.slice(0, i).join(':'));
       }
    }
    if (object !== '*') {
        list.push('*');
    }
    return list;
};

const sqlUserRoles = 'select count(*) as cnt from "role" where user_id=$1';

const setup = (pool) => {
    const hasRole = async (userId, role, object) => {
        const objects = str2list(object);
        let roles = [role];
        if (role != ROLE_ADMIN) {
            roles.push(ROLE_ADMIN);
        }
        let args = [userId];
        let p = 2;
        let sqlQuery = sqlUserRoles + ' and role in (';
        // add roles into query
        for (let i=0; i<roles.length; i++) {
            args.push(roles[i]);
            if (i > 0) {
                sqlQuery = sqlQuery + ', ';
            }
            sqlQuery = sqlQuery + '$' + p;
            p++;
        }
        sqlQuery = sqlQuery + ') and object in ('
        // add objects into query
        for (let i=0; i<objects.length; i++) {
            args.push(objects[i]);
            if (i > 0) {
                sqlQuery = sqlQuery + ', ';
            }
            sqlQuery = sqlQuery + '$' + p;
            p++;
        }
        sqlQuery = sqlQuery + ')';
        debug('Query', sqlQuery);
        debug('Args', args)
        const res = await pool.query(sqlQuery, args);
        debug('Results', res.rows);
        return (res.rows[0] && res.rows[0].cnt);
    };

    return { ROLE_ADMIN, ROLE_EDITOR, ROLE_CREATOR, ROLE_REVIEWER, ROLE_MENTOR,
             hasRole };
};

module.exports = { setup };

