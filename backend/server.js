const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// In-memory leaderboard
let leaderboard = [
    { name: 'AAA', score: 1000 },
    { name: 'BBB', score: 500 },
    { name: 'CCC', score: 250 }
];

app.get('/api/scores', (req, res) => {
    const topScores = leaderboard.sort((a, b) => b.score - a.score).slice(0, 10);
    res.json(topScores);
});

app.post('/api/scores', (req, res) => {
    const { name, score } = req.body;
    if (name && typeof score === 'number') {
        leaderboard.push({ name: name.substring(0, 3).toUpperCase(), score });
        res.status(201).json({ message: 'Score saved successfully' });
    } else {
        res.status(400).json({ error: 'Invalid data' });
    }
});

// Fallback to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
