import express from 'express';
import cors from 'cors';
import { initDb, getDb } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// GET /api/sites
app.get('/api/sites', (_req, res) => {
  const sites = getDb().prepare('SELECT id, name FROM sites').all();
  res.json(sites.map((s) => ({ id: String(s.id), name: s.name })));
});

// GET /api/spaces?siteId=
app.get('/api/spaces', (req, res) => {
  const { siteId } = req.query;
  if (!siteId) return res.status(400).json({ error: 'siteId is required' });

  const site = getDb().prepare('SELECT * FROM sites WHERE id = ?').get(Number(siteId));
  if (!site) return res.status(404).json({ error: 'Site not found' });

  // Mars is the intentional error case
  if (site.name === 'Mars') {
    return res.status(500).json({ error: 'Failed to load spaces for this site' });
  }

  const spaces  = getDb().prepare('SELECT * FROM spaces  WHERE site_id = ?').all(Number(siteId));
  const streams = getDb().prepare(`
    SELECT st.id, st.name, st.space_id
    FROM   streams st
    JOIN   spaces  sp ON sp.id = st.space_id
    WHERE  sp.site_id = ?
  `).all(Number(siteId));

  const streamsBySpace = streams.reduce((acc, row) => {
    (acc[row.space_id] ??= []).push({ id: row.id, name: row.name, spaceId: row.space_id });
    return acc;
  }, {});

  res.json(
    spaces.map((sp) => ({
      id:            sp.id,
      name:          sp.name,
      parentSpaceId: sp.parent_space_id ?? null,
      streams:       streamsBySpace[sp.id] ?? [],
    }))
  );
});

// POST /api/streams  { spaceId, name }
app.post('/api/streams', (req, res) => {
  const { spaceId, name } = req.body ?? {};
  if (!name?.trim())    return res.status(400).json({ error: 'name is required' });
  if (!spaceId)         return res.status(400).json({ error: 'spaceId is required' });

  const space = getDb().prepare('SELECT id FROM spaces WHERE id = ?').get(Number(spaceId));
  if (!space) return res.status(404).json({ error: 'Space not found' });

  // Simulate failure for streams named exactly "fail" (case-insensitive)
  if (name.trim().toLowerCase() === 'fail') {
    return setTimeout(
      () => res.status(500).json({ error: 'Failed to add stream' }),
      2000
    );
  }

  const result = getDb()
    .prepare('INSERT INTO streams (name, space_id) VALUES (?, ?)')
    .run(name.trim(), Number(spaceId));

  res.status(201).json({ id: result.lastInsertRowid, name: name.trim(), spaceId: Number(spaceId) });
});

// DELETE /api/streams/:id
app.delete('/api/streams/:id', (req, res) => {
  const id     = Number(req.params.id);
  const stream = getDb().prepare('SELECT * FROM streams WHERE id = ?').get(id);
  if (!stream) return res.status(404).json({ error: 'Stream not found' });

  // Simulate failure for streams whose name contains "fail" (case-insensitive)
  if (stream.name.toLowerCase().includes('fail')) {
    return setTimeout(
      () => res.status(500).json({ error: 'Failed to delete stream' }),
      2000
    );
  }

  getDb().prepare('DELETE FROM streams WHERE id = ?').run(id);
  res.status(204).send();
});

const PORT = 4001;
initDb();
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
