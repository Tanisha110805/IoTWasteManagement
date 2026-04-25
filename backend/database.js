const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'garbage_system.db');

// Ensure the directory for the database file exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
console.log('Connected to the SQLite database.');

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

initializeDatabase();

function initializeDatabase() {
    // ── Bins table ──────────────────────────────────────────────
    db.exec(`CREATE TABLE IF NOT EXISTS bins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        latitude REAL DEFAULT 0,
        longitude REAL DEFAULT 0,
        bin_depth INTEGER DEFAULT 20,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // ── Telemetry table ─────────────────────────────────────────
    db.exec(`CREATE TABLE IF NOT EXISTS telemetry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bin_id INTEGER NOT NULL DEFAULT 1,
        level INTEGER NOT NULL,
        temperature REAL DEFAULT NULL,
        humidity REAL DEFAULT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bin_id) REFERENCES bins(id)
    )`);

    // ── Notifications table ─────────────────────────────────────
    db.exec(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bin_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bin_id) REFERENCES bins(id)
    )`);

    // ── Collection logs ─────────────────────────────────────────
    db.exec(`CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bin_id INTEGER NOT NULL,
        collected_by TEXT DEFAULT 'System',
        level_before INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bin_id) REFERENCES bins(id)
    )`);

    // ── Seed bins ───────────────────────────────────────────────
    const row = db.prepare('SELECT COUNT(*) AS count FROM bins').get();
    if (row.count === 0) {
        const bins = [
            ['BIN-001', 'Main Gate, Block A',        28.6139,  77.2090],
            ['BIN-002', 'Cafeteria, Block B',        28.6145,  77.2105],
            ['BIN-003', 'Library, Block C',          28.6128,  77.2078],
            ['BIN-004', 'Hostel Entrance, Block D',  28.6152,  77.2115],
            ['BIN-005', 'Sports Ground, Block E',    28.6120,  77.2060],
            ['BIN-006', 'Admin Office, Block F',     28.6160,  77.2098],
        ];
        const stmt = db.prepare('INSERT INTO bins (name, location, latitude, longitude) VALUES (?,?,?,?)');
        for (const b of bins) stmt.run(...b);

        // Seed 120 telemetry rows spread across bins
        seedTelemetry();
    }
}

function seedTelemetry() {
    const stmt = db.prepare('INSERT INTO telemetry (bin_id, level, temperature, humidity, timestamp) VALUES (?,?,?,?,?)');
    const now = Date.now();

    const insertMany = db.transaction(() => {
        for (let i = 0; i < 120; i++) {
            const binId = (i % 6) + 1;
            const t = new Date(now - (120 - i) * 5 * 60000).toISOString(); // 5-min intervals going back
            const level = Math.min(100, Math.max(0, Math.floor(20 + 60 * Math.sin(i * 0.15 + binId) + Math.random() * 15)));
            const temp = +(25 + Math.random() * 10).toFixed(1);
            const hum = +(40 + Math.random() * 30).toFixed(1);
            stmt.run(binId, level, temp, hum, t);
        }

        // Seed some notifications
        const nStmt = db.prepare('INSERT INTO notifications (bin_id, type, message, is_read, timestamp) VALUES (?,?,?,?,?)');
        nStmt.run(1, 'critical', 'BIN-001 has reached 92% capacity!',          0, new Date(now - 3600000).toISOString());
        nStmt.run(2, 'warning',  'BIN-002 is at 68% capacity — schedule pickup', 0, new Date(now - 7200000).toISOString());
        nStmt.run(4, 'critical', 'BIN-004 has reached 88% capacity!',          1, new Date(now - 14400000).toISOString());
        nStmt.run(3, 'info',     'BIN-003 was emptied by collection team.',     1, new Date(now - 21600000).toISOString());
        nStmt.run(5, 'warning',  'BIN-005 is at 72% capacity — schedule pickup', 0, new Date(now - 10800000).toISOString());

        // Seed some collections
        const cStmt = db.prepare('INSERT INTO collections (bin_id, collected_by, level_before, timestamp) VALUES (?,?,?,?)');
        cStmt.run(3, 'Driver - Ramesh', 95, new Date(now - 21600000).toISOString());
        cStmt.run(1, 'Driver - Suresh', 89, new Date(now - 43200000).toISOString());
        cStmt.run(6, 'Driver - Amit',   78, new Date(now - 64800000).toISOString());
    });

    insertMany();
    console.log('Seeded database with sample data.');
}

module.exports = db;
