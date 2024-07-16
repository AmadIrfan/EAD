// app.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3001;

app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('./tasks.db');

// Create tasks table if not exists
db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    completed INTEGER DEFAULT 0
)`);

// Routes
app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});
app.delete('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    db.run('DELETE FROM tasks WHERE id = ?', [taskId], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Task deleted successfully' });
    });
});
app.get('/', (req,res) => {
    res.send('this is my sqlite server');    
})
app.put('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const { title, completed } = req.body;

    if (!title && completed === undefined) {
        res.status(400).json({ error: 'Title or completed status is required' });
        return;
    }

    const updateValues = [];
    let updateQuery = 'UPDATE tasks SET';

    if (title) {
        updateQuery += ' title = ?,';
        updateValues.push(title);
    }

    if (completed !== undefined) {
        updateQuery += ' completed = ?,';
        updateValues.push(completed ? 1 : 0);
    }

    // Remove trailing comma from the updateQuery
    updateQuery = updateQuery.slice(0, -1);

    updateQuery += ' WHERE id = ?';
    updateValues.push(taskId);

    db.run(updateQuery, updateValues, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Task updated successfully' });
    });
});


app.post('/tasks', (req, res) => {
    const { title } = req.body;
    if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
    }

    db.run('INSERT INTO tasks (title) VALUES (?)', [title], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, title: title, completed: 0 });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
