const session = require('express-session');

class DatabaseSessionStore extends session.Store {
    constructor(db) {
        super();
        this.db = db;
    }

    async get(sid, callback) {
        try {
            const row = await this.db.getAsync(
                'SELECT sess FROM sessions WHERE sid = ? AND expired > ?',
                [sid, Date.now()]
            );
            if (!row || !row.sess) {
                return callback(null, null);
            }
            const sess = JSON.parse(row.sess);
            return callback(null, sess);
        } catch (err) {
            console.error('[SessionStore] Get error:', err.message);
            return callback(null, null); // Fallback gracefully rather than crashing
        }
    }

    async set(sid, sess, callback) {
        try {
            const maxAge = (sess.cookie && sess.cookie.maxAge) ? sess.cookie.maxAge : 24 * 60 * 60 * 1000;
            const expired = Date.now() + maxAge;
            const sessStr = JSON.stringify(sess);
            await this.db.runAsync(
                'INSERT INTO sessions (sid, sess, expired) VALUES (?, ?, ?) ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expired = excluded.expired',
                [sid, sessStr, expired]
            );
            if (callback) callback(null);
        } catch (err) {
            console.error('[SessionStore] Set error:', err.message);
            if (callback) callback(null); // Do not bubble error to crash request
        }
    }

    async destroy(sid, callback) {
        try {
            await this.db.runAsync('DELETE FROM sessions WHERE sid = ?', [sid]);
            if (callback) callback(null);
        } catch (err) {
            console.error('[SessionStore] Destroy error:', err.message);
            if (callback) callback(null);
        }
    }

    async touch(sid, sess, callback) {
        try {
            const maxAge = (sess.cookie && sess.cookie.maxAge) ? sess.cookie.maxAge : 24 * 60 * 60 * 1000;
            const expired = Date.now() + maxAge;
            await this.db.runAsync('UPDATE sessions SET expired = ? WHERE sid = ?', [expired, sid]);
            if (callback) callback(null);
        } catch (err) {
            if (callback) callback(null);
        }
    }
}

module.exports = DatabaseSessionStore;
