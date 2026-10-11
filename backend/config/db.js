const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const isVercel = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

let client;
let clientType = 'local-sqlite';

if (tursoUrl && (tursoUrl.startsWith('libsql://') || tursoUrl.startsWith('https://') || tursoUrl.startsWith('http://'))) {
    // 1. Persistent Cloud Turso / libSQL Database (Production recommended for Vercel)
    clientType = 'turso-cloud';
    console.log('[BookNest DB] Connecting to Turso Cloud Database:', tursoUrl.replace(/:[^:@]+@/, ':***@'));
    client = createClient({
        url: tursoUrl,
        authToken: tursoAuthToken
    });
} else if (isVercel) {
    // 2. Vercel Serverless fallback when no external cloud database is configured yet.
    // AWS Lambda root (/var/task) is strictly read-only.
    // We copy or create SQLite in /tmp (the only writable directory in serverless) to prevent function crashes.
    clientType = 'vercel-tmp-sqlite';
    const tmpDbPath = path.join('/tmp', 'bookhub.db');
    const sourceDbPath = path.resolve(__dirname, '../../database/bookhub.db');

    if (!fs.existsSync(tmpDbPath)) {
        if (fs.existsSync(sourceDbPath)) {
            try {
                fs.copyFileSync(sourceDbPath, tmpDbPath);
                console.log('[BookNest DB] Copied bundled database to /tmp/bookhub.db');
            } catch (copyErr) {
                console.warn('[BookNest DB] Could not copy bundled DB to /tmp:', copyErr.message);
            }
        }
    }

    console.warn('⚠️ [BookNest DB] Running on Vercel without a persistent cloud database (TURSO_DATABASE_URL not set).');
    console.warn('⚠️ [BookNest DB] Using ephemeral /tmp SQLite storage. Changes will NOT persist across serverless cold starts.');
    console.warn('⚠️ [BookNest DB] For persistent production storage, create a free database at https://turso.tech and set TURSO_DATABASE_URL.');

    client = createClient({
        url: 'file:' + tmpDbPath
    });
} else {
    // 3. Local Development (standard SQLite file)
    clientType = 'local-sqlite';
    const localDbPath = path.resolve(__dirname, '../../database/bookhub.db');
    const localDbDir = path.dirname(localDbPath);
    if (!fs.existsSync(localDbDir)) {
        fs.mkdirSync(localDbDir, { recursive: true });
    }
    client = createClient({
        url: 'file:' + localDbPath
    });
    console.log('[BookNest DB] Connected to local SQLite file at:', localDbPath);
}

// Database helper functions matching promisified query interface
const db = {
    clientType,
    rawClient: client,

    async getAsync(sql, params = []) {
        const res = await client.execute({ sql, args: params });
        return res.rows && res.rows.length > 0 ? res.rows[0] : undefined;
    },

    async allAsync(sql, params = []) {
        const res = await client.execute({ sql, args: params });
        return res.rows ? Array.from(res.rows) : [];
    },

    async runAsync(sql, params = []) {
        const res = await client.execute({ sql, args: params });
        return {
            lastID: res.lastInsertRowid !== undefined && res.lastInsertRowid !== null ? Number(res.lastInsertRowid) : 0,
            changes: res.rowsAffected || 0
        };
    },

    async execAsync(sql) {
        return client.executeMultiple(sql);
    }
};

// Automatic schema initialization (creates tables if not exists)
let schemaPromise = null;
async function ensureSchema() {
    if (!schemaPromise) {
        schemaPromise = (async () => {
            try {
                const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
                if (fs.existsSync(schemaPath)) {
                    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
                    await client.executeMultiple(schemaSql);
                    console.log('[BookNest DB] Database schema verified/initialized successfully.');
                }
            } catch (err) {
                console.error('[BookNest DB] Schema initialization error:', err.message);
            }
        })();
    }
    return schemaPromise;
}

// Auto-run schema check
ensureSchema().catch(err => console.error('[BookNest DB] Schema init error:', err));

db.ensureSchema = ensureSchema;

module.exports = db;
