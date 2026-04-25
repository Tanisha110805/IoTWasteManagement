const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'super_secret_jwt_key_123';

app.use(cors());
app.use(express.json());

// ── JWT Middleware ───────────────────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// ── Auth ─────────────────────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'vvit@123') {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, message: 'Login Successful' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// ── Telemetry POST  (from NodeMCU) ──────────────────────────────────────────
app.post('/api/telemetry', (req, res) => {
    const { bin_id = 1, anloga, temperature, humidity } = req.body;
    if (anloga === undefined) return res.status(400).json({ error: 'Missing anloga field' });

    const level = parseInt(anloga);
    const temp = temperature ? parseFloat(temperature) : null;
    const hum  = humidity    ? parseFloat(humidity)    : null;

    try {
        const result = db.prepare(
            'INSERT INTO telemetry (bin_id, level, temperature, humidity) VALUES (?,?,?,?)'
        ).run(bin_id, level, temp, hum);

        // Auto-generate notifications
        if (level >= 80) {
            db.prepare(
                'INSERT INTO notifications (bin_id, type, message) VALUES (?,?,?)'
            ).run(bin_id, 'critical', `Bin ${bin_id} has reached ${level}% capacity!`);
        } else if (level >= 60) {
            db.prepare(
                'INSERT INTO notifications (bin_id, type, message) VALUES (?,?,?)'
            ).run(bin_id, 'warning', `Bin ${bin_id} is at ${level}% capacity — schedule pickup`);
        }

        res.json({ message: 'Data received', id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// ── Dashboard overview ──────────────────────────────────────────────────────
app.get('/api/dashboard', authenticateToken, (req, res) => {
    try {
        const bins = db.prepare(`
            SELECT b.id, b.name, b.location, b.latitude, b.longitude,
                   t.level, t.temperature, t.humidity, t.timestamp
            FROM bins b
            LEFT JOIN telemetry t ON t.id = (
                SELECT id FROM telemetry WHERE bin_id = b.id ORDER BY id DESC LIMIT 1
            )
            ORDER BY b.id
        `).all();

        // Summary stats
        const totalBins = bins.length;
        const criticalBins = bins.filter(b => b.level >= 80).length;
        const warningBins  = bins.filter(b => b.level >= 50 && b.level < 80).length;
        const normalBins   = bins.filter(b => b.level < 50).length;
        const avgLevel     = bins.length ? Math.round(bins.reduce((s, b) => s + (b.level || 0), 0) / bins.length) : 0;

        // Unread notifications count
        const nRow = db.prepare('SELECT COUNT(*) AS count FROM notifications WHERE is_read = 0').get();

        res.json({
            bins,
            stats: { totalBins, criticalBins, warningBins, normalBins, avgLevel },
            unreadNotifications: nRow ? nRow.count : 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Single bin history ──────────────────────────────────────────────────────
app.get('/api/bins/:id/history', authenticateToken, (req, res) => {
    try {
        const rows = db.prepare(
            'SELECT level, temperature, humidity, timestamp FROM telemetry WHERE bin_id = ? ORDER BY id DESC LIMIT 100'
        ).all(req.params.id);
        res.json({ history: rows.reverse() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Analytics  ──────────────────────────────────────────────────────────────
app.get('/api/analytics', authenticateToken, (req, res) => {
    try {
        const hourly = db.prepare(
            `SELECT bin_id, 
                    strftime('%H:00', timestamp) AS hour, 
                    ROUND(AVG(level)) AS avg_level
             FROM telemetry 
             WHERE timestamp >= datetime('now', '-24 hours')
             GROUP BY bin_id, hour
             ORDER BY hour`
        ).all();

        const perBin = db.prepare(
            `SELECT b.name, ROUND(AVG(t.level)) AS avg_level, MAX(t.level) AS max_level, MIN(t.level) AS min_level, COUNT(t.id) AS readings
             FROM bins b LEFT JOIN telemetry t ON t.bin_id = b.id
             GROUP BY b.id ORDER BY b.id`
        ).all();

        const dist = db.prepare(
            `SELECT 
                SUM(CASE WHEN level < 25 THEN 1 ELSE 0 END) AS low,
                SUM(CASE WHEN level >= 25 AND level < 50 THEN 1 ELSE 0 END) AS moderate,
                SUM(CASE WHEN level >= 50 AND level < 75 THEN 1 ELSE 0 END) AS high,
                SUM(CASE WHEN level >= 75 THEN 1 ELSE 0 END) AS critical
             FROM telemetry`
        ).get();

        res.json({ hourly, perBin, distribution: dist || {} });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Notifications ───────────────────────────────────────────────────────────
app.get('/api/notifications', authenticateToken, (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM notifications ORDER BY id DESC LIMIT 50').all();
        res.json({ notifications: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/notifications/read-all', authenticateToken, (req, res) => {
    try {
        db.prepare('UPDATE notifications SET is_read = 1').run();
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Collections ─────────────────────────────────────────────────────────────
app.get('/api/collections', authenticateToken, (req, res) => {
    try {
        const rows = db.prepare(
            `SELECT c.*, b.name AS bin_name, b.location AS bin_location
             FROM collections c JOIN bins b ON c.bin_id = b.id
             ORDER BY c.id DESC LIMIT 50`
        ).all();
        res.json({ collections: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/collections', authenticateToken, (req, res) => {
    const { bin_id, collected_by } = req.body;
    try {
        const row = db.prepare('SELECT level FROM telemetry WHERE bin_id = ? ORDER BY id DESC LIMIT 1').get(bin_id);
        const lvl = row ? row.level : 0;

        const result = db.prepare(
            'INSERT INTO collections (bin_id, collected_by, level_before) VALUES (?,?,?)'
        ).run(bin_id, collected_by || 'Admin', lvl);

        // Reset level
        db.prepare('INSERT INTO telemetry (bin_id, level, temperature, humidity) VALUES (?,0,NULL,NULL)').run(bin_id);
        db.prepare('INSERT INTO notifications (bin_id, type, message) VALUES (?,?,?)').run(
            bin_id, 'info', `Bin ${bin_id} was emptied by ${collected_by || 'Admin'}.`
        );

        res.json({ message: 'Collection recorded', id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Simulator (generates random data) ───────────────────────────────────────
app.post('/api/simulator/tick', authenticateToken, (req, res) => {
    try {
        const bins = db.prepare('SELECT id FROM bins').all();
        const stmt = db.prepare('INSERT INTO telemetry (bin_id, level, temperature, humidity) VALUES (?,?,?,?)');
        const notifStmt = db.prepare('INSERT INTO notifications (bin_id, type, message) VALUES (?,?,?)');

        const simulateAll = db.transaction(() => {
            for (const b of bins) {
                const level = Math.min(100, Math.max(0, Math.floor(Math.random() * 100)));
                const temp  = +(22 + Math.random() * 13).toFixed(1);
                const hum   = +(35 + Math.random() * 35).toFixed(1);
                stmt.run(b.id, level, temp, hum);

                if (level >= 80) {
                    notifStmt.run(b.id, 'critical', `Bin ${b.id} has reached ${level}% capacity!`);
                }
            }
        });

        simulateAll();
        res.json({ message: 'Simulated data for all bins' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Server running → http://localhost:${PORT}`);
});
