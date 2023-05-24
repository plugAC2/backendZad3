const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 4000;

app.use(cors());

const db = new sqlite3.Database(':memory:');

db.run(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  task TEXT
)`);

app.use(express.json());

app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(rows);
        }
    });
});

app.get('/tasks/:id', (req, res) => {
    const id = req.params.id;

    db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else if (row) {
            res.json(row);
        } else {
            res.status(404).send('Task not found');
        }
    });
});

app.post('/tasks', (req, res) => {
    const { title, task } = req.body;

    if (!title || !task) {
        res.status(400).send('Title and task are required');
        return;
    }

    db.run('INSERT INTO tasks (title, task) VALUES (?, ?)', [title, task], function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json({ id: this.lastID });
        }
    });
});

app.put('/tasks/:id', (req, res) => {
    const id = req.params.id;
    const { title, task } = req.body;

    if (!title || !task) {
        res.status(400).send('Title and task are required');
        return;
    }

    db.run('UPDATE tasks SET title = ?, task = ? WHERE id = ?', [title, task, id], function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else if (this.changes === 0) {
            res.status(404).send('Task not found');
        } else {
            res.sendStatus(204);
        }
    });
});

app.delete('/tasks/:id', (req, res) => {
    const id = req.params.id;

    db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else if (this.changes === 0) {
            res.status(404).send('Task not found');
        } else {
            res.sendStatus(204);
        }
    });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
