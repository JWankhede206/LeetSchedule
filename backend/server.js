const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

app.post('/api/signup', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ error: 'User already exists' });
            }
            
            const hashedPassword = await bcrypt.hash(password, 10);
            
            db.query(
                'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
                [email, hashedPassword, firstName, lastName],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to create user' });
                    }
                    
                    const userId = result.insertId;
                    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET);
                    
                    res.json({
                        success: true,
                        token,
                        user: { id: userId, email, firstName, lastName }
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length === 0) {
                return res.status(400).json({ error: 'Invalid email or password' });
            }
            
            const user = results[0];
            const validPassword = await bcrypt.compare(password, user.password);
            
            if (!validPassword) {
                return res.status(400).json({ error: 'Invalid email or password' });
            }
            
            const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET);
            
            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name
                }
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/problems', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    
    db.query(
        'SELECT * FROM problems WHERE user_id = ? ORDER BY section, date_added DESC',
        [userId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch problems' });
            }
            
            const sections = [
                "Arrays", "Two Pointers", "Stack", "Binary Search", 
                "Sliding Window", "Linked List", "Trees", "Back Tracking", "DP"
            ];
            
            const groupedProblems = sections.reduce((acc, section) => {
                acc[section] = results.filter(problem => problem.section === section)
                    .map(problem => ({
                        id: problem.id,
                        name: problem.name,
                        difficulty: problem.difficulty,
                        status: problem.status,
                        notes: problem.notes || '',
                        dateAdded: problem.date_added
                    }));
                return acc;
            }, {});
            
            res.json({ tasks: groupedProblems });
        }
    );
});

app.post('/api/problems', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { name, section, difficulty, status } = req.body;
    
    db.query(
        'INSERT INTO problems (user_id, name, section, difficulty, status) VALUES (?, ?, ?, ?, ?)',
        [userId, name, section, difficulty, status],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to create problem' });
            }
            
            res.json({
                success: true,
                problem: {
                    id: result.insertId,
                    name,
                    section,
                    difficulty,
                    status,
                    notes: '',
                    dateAdded: new Date()
                }
            });
        }
    );
});

app.put('/api/problems/:id', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const problemId = req.params.id;
    const { name, difficulty, status, notes } = req.body;
    
    db.query(
        'UPDATE problems SET name = ?, difficulty = ?, status = ?, notes = ? WHERE id = ? AND user_id = ?',
        [name, difficulty, status, notes, problemId, userId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to update problem' });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Problem not found' });
            }
            
            res.json({ success: true });
        }
    );
});

app.delete('/api/problems/:id', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const problemId = req.params.id;
    
    db.query(
        'DELETE FROM problems WHERE id = ? AND user_id = ?',
        [problemId, userId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete problem' });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Problem not found' });
            }
            
            res.json({ success: true });
        }
    );
});

app.get('/api/user/settings', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    
    db.query(
        'SELECT * FROM users WHERE id = ?',
        [userId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            const user = results[0];
            res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name
                },
                settings: {
                    attemptedReviewDays: user.attempted_review_days || 3,
                    solvedReviewDays: user.solved_review_days || 5
                }
            });
        }
    );
});

app.put('/api/user/settings', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { email, firstName, lastName, attemptedReviewDays, solvedReviewDays } = req.body;
    
    if (!email || !firstName || !lastName) {
        return res.status(400).json({ error: 'Email, first name, and last name are required' });
    }
    
    if (attemptedReviewDays < 1 || attemptedReviewDays > 30 || solvedReviewDays < 1 || solvedReviewDays > 30) {
        return res.status(400).json({ error: 'Review days must be between 1 and 30' });
    }
    
    db.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ error: 'Email is already taken' });
            }
            
            db.query(
                'UPDATE users SET email = ?, first_name = ?, last_name = ?, attempted_review_days = ?, solved_review_days = ? WHERE id = ?',
                [email, firstName, lastName, attemptedReviewDays, solvedReviewDays, userId],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to update settings' });
                    }
                    
                    if (result.affectedRows === 0) {
                        return res.status(404).json({ error: 'User not found' });
                    }
                    
                    res.json({
                        success: true,
                        message: 'Settings updated successfully'
                    });
                }
            );
        }
    );
});

app.get('/', (req, res) => {
    res.send('LeetCode Tracker API Server');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});