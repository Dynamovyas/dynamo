const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'your-database-host',
    user: 'your-db-user',
    password: 'your-db-password',
    database: 'ElectionDB'
});

db.connect(err => {
    if (err) throw err;
    console.log("Database connected!");
});

// Endpoint to cast a vote
app.post('/vote', (req, res) => {
    const { voter_id, candidate_id } = req.body;
    const checkQuery = "SELECT * FROM Votes WHERE voter_id = ?";
    db.query(checkQuery, [voter_id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length > 0) return res.status(400).send("You have already voted!");

        const insertQuery = "INSERT INTO Votes (voter_id, candidate_id) VALUES (?, ?)";
        db.query(insertQuery, [voter_id, candidate_id], (err, result) => {
            if (err) return res.status(500).send(err);
            res.send("Vote cast successfully!");
        });
    });
});

// Endpoint to get results
app.get('/results', (req, res) => {
    const query = `
        SELECT c.name, COUNT(v.vote_id) AS total_votes
        FROM Candidates c 
        LEFT JOIN Votes v ON c.candidate_id = v.candidate_id 
        GROUP BY c.name`;
    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.listen(5000, () => console.log('Server running on port 5000'));
